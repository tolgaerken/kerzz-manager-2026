import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractSupport, ContractSupportDocument } from "./schemas/contract-support.schema";
import {
  ContractSupportQueryDto,
  CreateContractSupportDto,
  UpdateContractSupportDto,
  ContractSupportResponseDto,
  ContractSupportsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractSupportsService {
  constructor(
    @InjectModel(ContractSupport.name, CONTRACT_DB_CONNECTION)
    private contractSupportModel: Model<ContractSupportDocument>
  ) {}

  async findAll(query: ContractSupportQueryDto): Promise<ContractSupportsListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = { contractId };
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractSupportModel.find(filter).lean().exec(),
      this.contractSupportModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractSupportResponseDto> {
    const support = await this.contractSupportModel.findOne({ id }).lean().exec();
    if (!support) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }
    return this.mapToResponseDto(support);
  }

  async create(dto: CreateContractSupportDto): Promise<ContractSupportResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const support = new this.contractSupportModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await support.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractSupportDto): Promise<ContractSupportResponseDto> {
    const updated = await this.contractSupportModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractSupportModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }
  }

  private mapToResponseDto(support: ContractSupport): ContractSupportResponseDto {
    return {
      _id: support._id.toString(),
      id: support.id,
      contractId: support.contractId,
      brand: support.brand || "",
      licanceId: support.licanceId || "",
      price: support.price || 0,
      old_price: support.old_price || 0,
      currency: support.currency || "tl",
      type: support.type || "standart",
      yearly: support.yearly || false,
      enabled: support.enabled ?? true,
      blocked: support.blocked || false,
      expired: support.expired || false,
      lastOnlineDay: support.lastOnlineDay || 0,
      calulatedPrice: support.calulatedPrice || 0,
      editDate: support.editDate,
      editUser: support.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }
}
