import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import { OrgTitle, OrgTitleDocument } from "./schemas";
import {
  CreateOrgTitleDto,
  UpdateOrgTitleDto,
  OrgTitleQueryDto,
  OrgTitleResponseDto,
} from "./dto";

export interface PaginatedOrgTitleResponse {
  data: OrgTitleResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class OrgTitleService {
  private readonly logger = new Logger(OrgTitleService.name);

  constructor(
    @InjectModel(OrgTitle.name, SSO_DB_CONNECTION)
    private readonly titleModel: Model<OrgTitleDocument>
  ) {}

  /**
   * Tüm ünvanları listele
   */
  async findAll(query: OrgTitleQueryDto): Promise<PaginatedOrgTitleResponse> {
    const {
      page = 1,
      limit = 100,
      search,
      isActive,
      sortField = "sortOrder",
      sortOrder = "asc",
    } = query;

    const filter: Record<string, unknown> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ code: searchRegex }, { name: searchRegex }];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.titleModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.titleModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((d) => this.toResponseDto(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Aktif ünvanları listele (lookup için)
   */
  async findAllActive(): Promise<OrgTitleResponseDto[]> {
    const data = await this.titleModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    return data.map((d) => this.toResponseDto(d));
  }

  /**
   * ID'ye göre ünvan getir
   */
  async findById(id: string): Promise<OrgTitleResponseDto> {
    const title = await this.titleModel.findById(id).lean().exec();

    if (!title) {
      throw new NotFoundException(`Ünvan bulunamadı: ${id}`);
    }

    return this.toResponseDto(title);
  }

  /**
   * Kod'a göre ünvan getir
   */
  async findByCode(code: string): Promise<OrgTitleResponseDto | null> {
    const title = await this.titleModel.findOne({ code }).lean().exec();

    if (!title) {
      return null;
    }

    return this.toResponseDto(title);
  }

  /**
   * Ünvan kodu var mı kontrol et
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.titleModel.countDocuments({ code }).exec();
    return count > 0;
  }

  /**
   * Yeni ünvan oluştur
   */
  async create(dto: CreateOrgTitleDto): Promise<OrgTitleResponseDto> {
    // Kod benzersizlik kontrolü
    const existing = await this.titleModel.findOne({ code: dto.code }).lean().exec();
    if (existing) {
      throw new ConflictException(`Bu ünvan kodu zaten kullanılıyor: ${dto.code}`);
    }

    const title = new this.titleModel(dto);
    await title.save();

    this.logger.log(`Ünvan oluşturuldu: ${dto.code}`);
    return this.toResponseDto(title.toObject());
  }

  /**
   * Ünvan güncelle
   */
  async update(id: string, dto: UpdateOrgTitleDto): Promise<OrgTitleResponseDto> {
    const title = await this.titleModel.findById(id).exec();

    if (!title) {
      throw new NotFoundException(`Ünvan bulunamadı: ${id}`);
    }

    // Kod değişiyorsa benzersizlik kontrolü
    if (dto.code && dto.code !== title.code) {
      const existing = await this.titleModel.findOne({ code: dto.code }).lean().exec();
      if (existing) {
        throw new ConflictException(`Bu ünvan kodu zaten kullanılıyor: ${dto.code}`);
      }
    }

    Object.assign(title, dto);
    await title.save();

    this.logger.log(`Ünvan güncellendi: ${title.code}`);
    return this.toResponseDto(title.toObject());
  }

  /**
   * Ünvan sil
   */
  async delete(id: string): Promise<void> {
    const result = await this.titleModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Ünvan bulunamadı: ${id}`);
    }

    this.logger.log(`Ünvan silindi: ${result.code}`);
  }

  private toResponseDto(title: OrgTitle): OrgTitleResponseDto {
    return {
      _id: (title as OrgTitleDocument)._id?.toString() || "",
      code: title.code,
      name: title.name,
      isActive: title.isActive,
      description: title.description || "",
      sortOrder: title.sortOrder || 0,
      createdAt: title.createdAt,
      updatedAt: title.updatedAt,
    };
  }
}
