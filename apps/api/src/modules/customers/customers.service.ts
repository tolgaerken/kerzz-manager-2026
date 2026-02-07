import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Customer, CustomerDocument } from "./schemas/customer.schema";
import { CustomerQueryDto } from "./dto/customer-query.dto";
import {
  PaginatedCustomersResponseDto,
  CustomerResponseDto
} from "./dto/customer-response.dto";
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
      sortField = "name",
      sortOrder = "asc"
    } = query;

    const skip = (page - 1) * limit;

    // Base filter: taxNo must exist and not be null or empty
    const baseFilter: Record<string, any> = {
      taxNo: { $exists: true, $ne: null, $nin: ["", " "] }
    };

    let filter: Record<string, any> = { ...baseFilter };

    // Search filter
    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } },
          { erpId: { $regex: search, $options: "i" } },
          { taxNo: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
      filter = { $and: [baseFilter, searchFilter] };
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.customerModel.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerModel.findById(id).lean().exec();
    if (!customer) {
      throw new NotFoundException(`Müşteri bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(customer);
  }

  /**
   * Müşteriyi _id, id veya erpId alanına göre bulur
   */
  async findByAnyId(identifier: string): Promise<CustomerResponseDto> {
    let customer = await this.customerModel.findById(identifier).lean().exec().catch(() => null);
    if (!customer) {
      customer = await this.customerModel.findOne({ erpId: identifier }).lean().exec();
    }
    if (!customer) {
      customer = await this.customerModel.findOne({ id: identifier }).lean().exec();
    }
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

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    return {
      _id: customer._id.toString(),
      id: customer.id || "",
      erpId: customer.erpId || "",
      taxNo: customer.taxNo || "",
      name: customer.name || "",
      companyName: customer.companyName || "",
      address: customer.address || "",
      city: customer.city || "",
      district: customer.district || "",
      phone: customer.phone || "",
      email: customer.email || "",
      taxOffice: customer.taxOffice || "",
      enabled: customer.enabled ?? true,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }
}
