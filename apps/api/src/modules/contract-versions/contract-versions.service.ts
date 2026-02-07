import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractVersion, ContractVersionDocument } from "./schemas/contract-version.schema";
import {
  ContractVersionQueryDto,
  CreateContractVersionDto,
  UpdateContractVersionDto,
  ContractVersionResponseDto,
  ContractVersionsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractVersionsService {
  constructor(
    @InjectModel(ContractVersion.name, CONTRACT_DB_CONNECTION)
    private contractVersionModel: Model<ContractVersionDocument>
  ) {}

  async findAll(query: ContractVersionQueryDto): Promise<ContractVersionsListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = {};
    if (contractId) {
      filter.contractId = contractId;
    }
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractVersionModel.find(filter).lean().exec(),
      this.contractVersionModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractVersionResponseDto> {
    const version = await this.contractVersionModel.findOne({ id }).lean().exec();
    if (!version) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
    }
    return this.mapToResponseDto(version);
  }

  async create(dto: CreateContractVersionDto): Promise<ContractVersionResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const version = new this.contractVersionModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await version.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractVersionDto): Promise<ContractVersionResponseDto> {
    const updated = await this.contractVersionModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractVersionModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
    }
  }

  private mapToResponseDto(version: ContractVersion): ContractVersionResponseDto {
    return {
      _id: version._id.toString(),
      id: version.id,
      contractId: version.contractId,
      brand: version.brand || "",
      licanceId: version.licanceId || "",
      price: version.price || 0,
      old_price: version.old_price || 0,
      currency: version.currency || "tl",
      type: version.type || "",
      enabled: version.enabled ?? true,
      expired: version.expired || false,
      editDate: version.editDate,
      editUser: version.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
