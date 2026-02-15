import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { SSO_DB_CONNECTION } from "../../database";
import { OrgDepartment, OrgDepartmentDocument } from "./schemas";
import {
  CreateOrgDepartmentDto,
  UpdateOrgDepartmentDto,
  OrgDepartmentQueryDto,
  OrgDepartmentResponseDto,
} from "./dto";

export interface PaginatedOrgDepartmentResponse {
  data: OrgDepartmentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class OrgDepartmentService {
  private readonly logger = new Logger(OrgDepartmentService.name);

  constructor(
    @InjectModel(OrgDepartment.name, SSO_DB_CONNECTION)
    private readonly departmentModel: Model<OrgDepartmentDocument>
  ) {}

  /**
   * Tüm departmanları listele
   */
  async findAll(query: OrgDepartmentQueryDto): Promise<PaginatedOrgDepartmentResponse> {
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
      this.departmentModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.departmentModel.countDocuments(filter).exec(),
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
   * Aktif departmanları listele (lookup için)
   */
  async findAllActive(): Promise<OrgDepartmentResponseDto[]> {
    const data = await this.departmentModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    return data.map((d) => this.toResponseDto(d));
  }

  /**
   * ID'ye göre departman getir
   */
  async findById(id: string): Promise<OrgDepartmentResponseDto> {
    const department = await this.departmentModel.findById(id).lean().exec();

    if (!department) {
      throw new NotFoundException(`Departman bulunamadı: ${id}`);
    }

    return this.toResponseDto(department);
  }

  /**
   * Kod'a göre departman getir
   */
  async findByCode(code: string): Promise<OrgDepartmentResponseDto | null> {
    const department = await this.departmentModel.findOne({ code }).lean().exec();

    if (!department) {
      return null;
    }

    return this.toResponseDto(department);
  }

  /**
   * Departman kodu var mı kontrol et
   */
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.departmentModel.countDocuments({ code }).exec();
    return count > 0;
  }

  /**
   * Yeni departman oluştur
   */
  async create(dto: CreateOrgDepartmentDto): Promise<OrgDepartmentResponseDto> {
    // Kod benzersizlik kontrolü
    const existing = await this.departmentModel.findOne({ code: dto.code }).lean().exec();
    if (existing) {
      throw new ConflictException(`Bu departman kodu zaten kullanılıyor: ${dto.code}`);
    }

    const department = new this.departmentModel(dto);
    await department.save();

    this.logger.log(`Departman oluşturuldu: ${dto.code}`);
    return this.toResponseDto(department.toObject());
  }

  /**
   * Departman güncelle
   */
  async update(id: string, dto: UpdateOrgDepartmentDto): Promise<OrgDepartmentResponseDto> {
    const department = await this.departmentModel.findById(id).exec();

    if (!department) {
      throw new NotFoundException(`Departman bulunamadı: ${id}`);
    }

    // Kod değişiyorsa benzersizlik kontrolü
    if (dto.code && dto.code !== department.code) {
      const existing = await this.departmentModel.findOne({ code: dto.code }).lean().exec();
      if (existing) {
        throw new ConflictException(`Bu departman kodu zaten kullanılıyor: ${dto.code}`);
      }
    }

    Object.assign(department, dto);
    await department.save();

    this.logger.log(`Departman güncellendi: ${department.code}`);
    return this.toResponseDto(department.toObject());
  }

  /**
   * Departman sil
   */
  async delete(id: string): Promise<void> {
    const result = await this.departmentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Departman bulunamadı: ${id}`);
    }

    this.logger.log(`Departman silindi: ${result.code}`);
  }

  private toResponseDto(department: OrgDepartment): OrgDepartmentResponseDto {
    return {
      _id: (department as OrgDepartmentDocument)._id?.toString() || "",
      code: department.code,
      name: department.name,
      isActive: department.isActive,
      description: department.description || "",
      sortOrder: department.sortOrder || 0,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }
}
