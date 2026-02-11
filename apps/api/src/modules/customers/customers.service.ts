import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder, PipelineStage } from "mongoose";
import { Customer, CustomerDocument } from "./schemas/customer.schema";
import { CustomerQueryDto } from "./dto/customer-query.dto";
import {
  PaginatedCustomersResponseDto,
  CustomerResponseDto
} from "./dto/customer-response.dto";
import { CustomerMinimalResponseDto } from "./dto/customer-minimal-response.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>
  ) {}

  async findAll(query: CustomerQueryDto): Promise<PaginatedCustomersResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      type = "customer",
      sortField = "name",
      sortOrder = "asc",
      fields: rawFields
    } = query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);
    const skip = (numericPage - 1) * numericLimit;

    // fields parametresini güvenli şekilde parse et
    const fields = this.parseFields(rawFields);
    const isMinimalQuery = fields.length > 0;

    // Base filter: by default show only "customer" type (has taxNo)
    const baseFilter: Record<string, any> = {};

    if (type === "all") {
      // Show all types
    } else if (type === "prospect") {
      baseFilter.type = "prospect";
    } else {
      // Default: show only real customers (type=customer or legacy records with taxNo)
      baseFilter.$or = [
        { type: "customer" },
        { type: { $exists: false }, taxNo: { $exists: true, $ne: null, $nin: ["", " "] } }
      ];
    }

    let filter: Record<string, any> = { ...baseFilter };

    // Search filter
    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } },
          { erpId: { $regex: search, $options: "i" } },
          { taxNo: { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
      filter = { $and: [baseFilter, searchFilter] };
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
    const pipelineSort: Record<string, 1 | -1> = {};
    pipelineSort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Minimal query: aggregation pipeline ile sadece istenen alanları döndür
    if (isMinimalQuery) {
      const projectionStage: Record<string, 1> = { _id: 1 };
      for (const field of fields) {
        projectionStage[field] = 1;
      }

      const pipeline: PipelineStage[] = [
        { $match: filter },
        { $sort: pipelineSort },
        { $skip: skip },
        { $limit: numericLimit },
        { $project: projectionStage }
      ];

      const [data, total] = await Promise.all([
        this.customerModel.aggregate(pipeline).exec(),
        this.customerModel.countDocuments(filter).exec()
      ]);

      const totalPages = Math.ceil(total / numericLimit);

      return {
        data: data.map((doc) => this.mapToMinimalResponseDto(doc)) as unknown as CustomerResponseDto[],
        meta: {
          total,
          page: numericPage,
          limit: numericLimit,
          totalPages,
          hasNextPage: numericPage < totalPages,
          hasPrevPage: numericPage > 1
        }
      };
    }

    // Full query: Tüm alanları döndür
    const [data, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .lean()
        .exec(),
      this.customerModel.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(total / numericLimit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages,
        hasNextPage: numericPage < totalPages,
        hasPrevPage: numericPage > 1
      }
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.findCustomerByIdentifier(id);
    if (!customer) {
      throw new NotFoundException(`Müşteri bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(customer);
  }

  /**
   * Müşteriyi _id, id veya erpId alanına göre bulur
   */
  async findByAnyId(identifier: string): Promise<CustomerResponseDto> {
    const customer = await this.findCustomerByIdentifier(identifier);
    if (!customer) {
      throw new NotFoundException(`Müşteri bulunamadı: ${identifier}`);
    }
    return this.mapToResponseDto(customer);
  }

  async create(createDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = new this.customerModel(createDto);
    const saved = await customer.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, updateDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Müşteri bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(customer);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Müşteri bulunamadı: ${id}`);
    }
  }

  private async findCustomerByIdentifier(identifier: string): Promise<Customer | null> {
    const byBusinessId = await this.customerModel.findOne({ id: identifier }).lean().exec();
    if (byBusinessId) {
      return byBusinessId;
    }

    const byErpId = await this.customerModel.findOne({ erpId: identifier }).lean().exec();
    if (byErpId) {
      return byErpId;
    }

    if (!/^[a-f0-9]{24}$/i.test(identifier)) {
      return null;
    }

    return this.customerModel.findById(identifier).lean().exec();
  }

  private parseFields(fields: unknown): string[] {
    if (!fields) return [];
    if (typeof fields === "string") return fields.split(",").filter(Boolean);
    if (Array.isArray(fields)) return fields.filter((f) => typeof f === "string");
    return [];
  }

  private mapToMinimalResponseDto(customer: Record<string, unknown>): CustomerMinimalResponseDto {
    return {
      _id: String(customer._id),
      id: (customer.id as string) || "",
      name: customer.name as string | undefined,
      companyName: customer.companyName as string | undefined,
      erpId: customer.erpId as string | undefined,
      taxNo: customer.taxNo as string | undefined
    };
  }

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    const addr = customer.address || {} as any;
    return {
      _id: customer._id.toString(),
      type: customer.type || "customer",
      id: customer.id || "",
      erpId: customer.erpId || "",
      taxNo: customer.taxNo || "",
      name: customer.name || "",
      companyName: customer.companyName || "",
      address: {
        address: addr.address || "",
        cityId: addr.cityId || 0,
        city: addr.city || "",
        townId: addr.townId || 0,
        town: addr.town || "",
        districtId: addr.districtId || 0,
        district: addr.district || "",
        countryId: addr.countryId || "",
        country: addr.country || "",
      },
      phone: customer.phone || "",
      email: customer.email || "",
      taxOffice: customer.taxOffice || "",
      enabled: customer.enabled ?? true,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }
}
