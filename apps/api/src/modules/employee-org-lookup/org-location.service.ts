import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import { OrgLocation, OrgLocationDocument } from "./schemas";
import {
  CreateOrgLocationDto,
  UpdateOrgLocationDto,
  OrgLocationQueryDto,
  OrgLocationResponseDto,
} from "./dto";

export interface PaginatedOrgLocationResponse {
  data: OrgLocationResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class OrgLocationService {
  private readonly logger = new Logger(OrgLocationService.name);

  constructor(
    @InjectModel(OrgLocation.name, SSO_DB_CONNECTION)
    private readonly locationModel: Model<OrgLocationDocument>
  ) {}

  /**
   * Tüm lokasyonları listele
   */
  async findAll(query: OrgLocationQueryDto): Promise<PaginatedOrgLocationResponse> {
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
      filter.name = searchRegex;
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.locationModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.locationModel.countDocuments(filter).exec(),
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
   * Aktif lokasyonları listele (lookup için)
   */
  async findAllActive(): Promise<OrgLocationResponseDto[]> {
    const data = await this.locationModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    return data.map((d) => this.toResponseDto(d));
  }

  /**
   * ID'ye göre lokasyon getir
   */
  async findById(id: string): Promise<OrgLocationResponseDto> {
    const location = await this.locationModel.findById(id).lean().exec();

    if (!location) {
      throw new NotFoundException(`Lokasyon bulunamadı: ${id}`);
    }

    return this.toResponseDto(location);
  }

  /**
   * İsme göre lokasyon getir
   */
  async findByName(name: string): Promise<OrgLocationResponseDto | null> {
    const location = await this.locationModel.findOne({ name }).lean().exec();

    if (!location) {
      return null;
    }

    return this.toResponseDto(location);
  }

  /**
   * Lokasyon adı var mı kontrol et
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.locationModel.countDocuments({ name }).exec();
    return count > 0;
  }

  /**
   * Yeni lokasyon oluştur
   */
  async create(dto: CreateOrgLocationDto): Promise<OrgLocationResponseDto> {
    // İsim benzersizlik kontrolü
    const existing = await this.locationModel.findOne({ name: dto.name }).lean().exec();
    if (existing) {
      throw new ConflictException(`Bu lokasyon adı zaten kullanılıyor: ${dto.name}`);
    }

    const location = new this.locationModel(dto);
    await location.save();

    this.logger.log(`Lokasyon oluşturuldu: ${dto.name}`);
    return this.toResponseDto(location.toObject());
  }

  /**
   * Lokasyon güncelle
   */
  async update(id: string, dto: UpdateOrgLocationDto): Promise<OrgLocationResponseDto> {
    const location = await this.locationModel.findById(id).exec();

    if (!location) {
      throw new NotFoundException(`Lokasyon bulunamadı: ${id}`);
    }

    // İsim değişiyorsa benzersizlik kontrolü
    if (dto.name && dto.name !== location.name) {
      const existing = await this.locationModel.findOne({ name: dto.name }).lean().exec();
      if (existing) {
        throw new ConflictException(`Bu lokasyon adı zaten kullanılıyor: ${dto.name}`);
      }
    }

    Object.assign(location, dto);
    await location.save();

    this.logger.log(`Lokasyon güncellendi: ${location.name}`);
    return this.toResponseDto(location.toObject());
  }

  /**
   * Lokasyon sil
   */
  async delete(id: string): Promise<void> {
    const result = await this.locationModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Lokasyon bulunamadı: ${id}`);
    }

    this.logger.log(`Lokasyon silindi: ${result.name}`);
  }

  private toResponseDto(location: OrgLocation): OrgLocationResponseDto {
    return {
      _id: (location as OrgLocationDocument)._id?.toString() || "",
      name: location.name,
      isActive: location.isActive,
      address: location.address || "",
      description: location.description || "",
      sortOrder: location.sortOrder || 0,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }
}
