import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { SoftwareProduct, SoftwareProductDocument } from "./schemas/software-product.schema";
import { SoftwareProductQueryDto } from "./dto/software-product-query.dto";
import {
  PaginatedSoftwareProductsResponseDto,
  SoftwareProductResponseDto,
  SoftwareProductCountsDto
} from "./dto/software-product-response.dto";
import { CreateSoftwareProductDto } from "./dto/create-software-product.dto";
import { UpdateSoftwareProductDto } from "./dto/update-software-product.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class SoftwareProductsService {
  constructor(
    @InjectModel(SoftwareProduct.name, CONTRACT_DB_CONNECTION)
    private softwareProductModel: Model<SoftwareProductDocument>
  ) {}

  async findAll(query: SoftwareProductQueryDto): Promise<PaginatedSoftwareProductsResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      saleActive,
      isSaas,
      type,
      sortField = "name",
      sortOrder = "asc"
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: Record<string, any> = {};

    // Sale active filter
    if (saleActive !== undefined) {
      filter.saleActive = saleActive;
    }

    // isSaas filter
    if (isSaas !== undefined) {
      filter.isSaas = isSaas;
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { friendlyName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { erpId: { $regex: search, $options: "i" } },
        { nameWithCode: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      this.softwareProductModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.softwareProductModel.countDocuments(filter).exec(),
      this.getCounts()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      counts
    };
  }

  async findOne(id: string): Promise<SoftwareProductResponseDto> {
    const product = await this.softwareProductModel.findById(id).lean().exec();
    if (!product) {
      throw new NotFoundException(`Yazılım ürünü bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(product);
  }

  async create(createDto: CreateSoftwareProductDto): Promise<SoftwareProductResponseDto> {
    const nameWithCode = createDto.erpId 
      ? `[${createDto.erpId}] - ${createDto.name}`
      : createDto.name;

    const productData = {
      ...createDto,
      editDate: new Date(),
      friendlyName: createDto.friendlyName || createDto.name,
      currency: createDto.currency || "usd",
      vatRate: createDto.vatRate ?? 20,
      type: createDto.type || "module",
      isSaas: createDto.isSaas ?? false,
      saleActive: createDto.saleActive ?? true,
      unit: createDto.unit || "AD",
      nameWithCode
    };

    const product = new this.softwareProductModel(productData);
    const saved = await product.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, updateDto: UpdateSoftwareProductDto): Promise<SoftwareProductResponseDto> {
    // Fetch current for nameWithCode update
    const current = await this.softwareProductModel.findById(id).lean().exec();
    if (!current) {
      throw new NotFoundException(`Yazılım ürünü bulunamadı: ${id}`);
    }

    const erpId = updateDto.erpId || current.erpId;
    const name = updateDto.name || current.name;
    const nameWithCode = erpId ? `[${erpId}] - ${name}` : name;

    const updateData = {
      ...updateDto,
      editDate: new Date(),
      nameWithCode
    };

    const product = await this.softwareProductModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException(`Yazılım ürünü bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.softwareProductModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Yazılım ürünü bulunamadı: ${id}`);
    }
  }

  private async getCounts(): Promise<SoftwareProductCountsDto> {
    const [total, active, inactive, saas, nonSaas] = await Promise.all([
      this.softwareProductModel.countDocuments({}).exec(),
      this.softwareProductModel.countDocuments({ saleActive: true }).exec(),
      this.softwareProductModel.countDocuments({ saleActive: false }).exec(),
      this.softwareProductModel.countDocuments({ isSaas: true }).exec(),
      this.softwareProductModel.countDocuments({ isSaas: false }).exec()
    ]);

    return {
      total,
      active,
      inactive,
      saas,
      nonSaas
    };
  }

  private mapToResponseDto(product: SoftwareProduct): SoftwareProductResponseDto {
    return {
      _id: product._id.toString(),
      id: product.id,
      name: product.name,
      friendlyName: product.friendlyName || "",
      description: product.description || "",
      erpId: product.erpId || "",
      pid: product.pid || "",
      purchasePrice: product.purchasePrice || 0,
      salePrice: product.salePrice || 0,
      vatRate: product.vatRate || 20,
      currency: product.currency || "usd",
      type: product.type || "module",
      isSaas: product.isSaas ?? false,
      saleActive: product.saleActive ?? true,
      unit: product.unit || "AD",
      nameWithCode: product.nameWithCode || "",
      editDate: product.editDate,
      editUser: product.editUser
    };
  }
}
