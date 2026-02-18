import {
  Injectable,
  NotFoundException,
  ConflictException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import {
  CustomerSegment,
  CustomerSegmentDocument
} from "./schemas/customer-segment.schema";
import { CustomerSegmentQueryDto } from "./dto/customer-segment-query.dto";
import {
  PaginatedCustomerSegmentsResponseDto,
  CustomerSegmentResponseDto
} from "./dto/customer-segment-response.dto";
import { CreateCustomerSegmentDto } from "./dto/create-customer-segment.dto";
import { UpdateCustomerSegmentDto } from "./dto/update-customer-segment.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class CustomerSegmentsService {
  constructor(
    @InjectModel(CustomerSegment.name, CONTRACT_DB_CONNECTION)
    private segmentModel: Model<CustomerSegmentDocument>
  ) {}

  async findAll(
    query: CustomerSegmentQueryDto
  ): Promise<PaginatedCustomerSegmentsResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      sortField = "name",
      sortOrder = "asc"
    } = query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);
    const skip = (numericPage - 1) * numericLimit;

    let filter: Record<string, unknown> = {};

    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.segmentModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit)
        .lean()
        .exec(),
      this.segmentModel.countDocuments(filter).exec()
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

  async findAllMinimal(): Promise<CustomerSegmentResponseDto[]> {
    const data = await this.segmentModel
      .find({ enabled: true })
      .sort({ name: 1 })
      .lean()
      .exec();

    return data.map((doc) => this.mapToResponseDto(doc));
  }

  async findOne(id: string): Promise<CustomerSegmentResponseDto> {
    const segment = await this.segmentModel.findById(id).lean().exec();

    if (!segment) {
      throw new NotFoundException(`Segment bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(segment);
  }

  async create(
    createDto: CreateCustomerSegmentDto
  ): Promise<CustomerSegmentResponseDto> {
    const existing = await this.segmentModel
      .findOne({ name: createDto.name })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException(
        `Bu isimde bir segment zaten mevcut: ${createDto.name}`
      );
    }

    const segment = new this.segmentModel(createDto);
    const saved = await segment.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(
    id: string,
    updateDto: UpdateCustomerSegmentDto
  ): Promise<CustomerSegmentResponseDto> {
    if (updateDto.name) {
      const existing = await this.segmentModel
        .findOne({ name: updateDto.name, _id: { $ne: id } })
        .lean()
        .exec();

      if (existing) {
        throw new ConflictException(
          `Bu isimde bir segment zaten mevcut: ${updateDto.name}`
        );
      }
    }

    const segment = await this.segmentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean()
      .exec();

    if (!segment) {
      throw new NotFoundException(`Segment bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(segment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.segmentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Segment bulunamadı: ${id}`);
    }
  }

  private mapToResponseDto(
    segment: CustomerSegment
  ): CustomerSegmentResponseDto {
    return {
      _id: segment._id.toString(),
      name: segment.name || "",
      description: segment.description || "",
      invoiceOverdueNotification: segment.invoiceOverdueNotification ?? true,
      newInvoiceNotification: segment.newInvoiceNotification ?? true,
      lastPaymentNotification: segment.lastPaymentNotification ?? true,
      balanceNotification: segment.balanceNotification ?? true,
      annualContractExpiryNotification:
        segment.annualContractExpiryNotification ?? true,
      monthlyContractExpiryNotification:
        segment.monthlyContractExpiryNotification ?? true,
      canBlockCashRegister: segment.canBlockCashRegister ?? false,
      canBlockLicense: segment.canBlockLicense ?? false,
      enabled: segment.enabled ?? true,
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt
    };
  }
}
