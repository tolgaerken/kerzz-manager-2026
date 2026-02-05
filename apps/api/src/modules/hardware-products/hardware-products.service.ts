import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, SortOrder } from "mongoose";
import { HardwareProduct, HardwareProductDocument } from "./schemas/hardware-product.schema";
import { HardwareProductQueryDto } from "./dto/hardware-product-query.dto";
import {
  PaginatedHardwareProductsResponseDto,
  HardwareProductResponseDto,
  HardwareProductCountsDto
} from "./dto/hardware-product-response.dto";
import { CreateHardwareProductDto } from "./dto/create-hardware-product.dto";
import { UpdateHardwareProductDto } from "./dto/update-hardware-product.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class HardwareProductsService {
  constructor(
    @InjectModel(HardwareProduct.name, CONTRACT_DB_CONNECTION)
    private hardwareProductModel: Model<HardwareProductDocument>
  ) {}

  async findAll(query: HardwareProductQueryDto): Promise<PaginatedHardwareProductsResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      saleActive,
      currency,
      sortField = "name",
      sortOrder = "asc"
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: FilterQuery<HardwareProductDocument> = {};

    // Sale active filter
    if (saleActive !== undefined) {
      filter.saleActive = saleActive;
    }

    // Currency filter
    if (currency) {
      filter.currency = currency;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { friendlyName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { erpId: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      this.hardwareProductModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.hardwareProductModel.countDocuments(filter).exec(),
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

  async findOne(id: string): Promise<HardwareProductResponseDto> {
    const product = await this.hardwareProductModel.findById(id).lean().exec();
    if (!product) {
      throw new NotFoundException(`Donanım ürünü bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(product);
  }

  async create(createDto: CreateHardwareProductDto): Promise<HardwareProductResponseDto> {
    const productData = {
      ...createDto,
      editDate: new Date(),
      friendlyName: createDto.friendlyName || createDto.name,
      currency: createDto.currency || "usd",
      purchaseCurrency: createDto.purchaseCurrency || "usd",
      saleCurrency: createDto.saleCurrency || "usd",
      vatRate: createDto.vatRate ?? 20,
      saleActive: createDto.saleActive ?? true,
      unit: createDto.unit || "AD"
    };

    const product = new this.hardwareProductModel(productData);
    const saved = await product.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, updateDto: UpdateHardwareProductDto): Promise<HardwareProductResponseDto> {
    const updateData = {
      ...updateDto,
      editDate: new Date()
    };

    const product = await this.hardwareProductModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException(`Donanım ürünü bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.hardwareProductModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Donanım ürünü bulunamadı: ${id}`);
    }
  }

  private async getCounts(): Promise<HardwareProductCountsDto> {
    const [total, active, inactive] = await Promise.all([
      this.hardwareProductModel.countDocuments({}).exec(),
      this.hardwareProductModel.countDocuments({ saleActive: true }).exec(),
      this.hardwareProductModel.countDocuments({ saleActive: false }).exec()
    ]);

    return {
      total,
      active,
      inactive
    };
  }

  private mapToResponseDto(product: HardwareProduct): HardwareProductResponseDto {
    return {
      _id: product._id.toString(),
      id: product.id,
      name: product.name,
      friendlyName: product.friendlyName || "",
      description: product.description || "",
      erpId: product.erpId || "",
      purchasePrice: product.purchasePrice || 0,
      salePrice: product.salePrice || 0,
      vatRate: product.vatRate || 20,
      currency: product.currency || "usd",
      purchaseCurrency: product.purchaseCurrency || "usd",
      saleCurrency: product.saleCurrency || "usd",
      saleActive: product.saleActive ?? true,
      unit: product.unit || "AD",
      editDate: product.editDate,
      editUser: product.editUser,
      updaterId: product.updaterId
    };
  }
}
