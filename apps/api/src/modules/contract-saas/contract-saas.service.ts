import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractSaas, ContractSaasDocument } from "./schemas/contract-saas.schema";
import {
  ContractSaasQueryDto,
  CreateContractSaasDto,
  UpdateContractSaasDto,
  ContractSaasResponseDto,
  ContractSaasListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractSaasService {
  constructor(
    @InjectModel(ContractSaas.name, CONTRACT_DB_CONNECTION)
    private contractSaasModel: Model<ContractSaasDocument>
  ) {}

  async findAll(query: ContractSaasQueryDto): Promise<ContractSaasListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = { contractId };
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractSaasModel.find(filter).lean().exec(),
      this.contractSaasModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractSaasResponseDto> {
    const saas = await this.contractSaasModel.findOne({ id }).lean().exec();
    if (!saas) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }
    return this.mapToResponseDto(saas);
  }

  async create(dto: CreateContractSaasDto): Promise<ContractSaasResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const saas = new this.contractSaasModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await saas.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractSaasDto): Promise<ContractSaasResponseDto> {
    const updated = await this.contractSaasModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractSaasModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }
  }

  private mapToResponseDto(saas: ContractSaas): ContractSaasResponseDto {
    return {
      _id: saas._id.toString(),
      id: saas.id,
      contractId: saas.contractId,
      brand: saas.brand || "",
      licanceId: saas.licanceId || "",
      description: saas.description || "",
      price: saas.price || 0,
      old_price: saas.old_price || 0,
      qty: saas.qty || 1,
      currency: saas.currency || "tl",
      yearly: saas.yearly || false,
      enabled: saas.enabled ?? true,
      expired: saas.expired || false,
      blocked: saas.blocked || false,
      productId: saas.productId || "",
      total: saas.total || 0,
      editDate: saas.editDate,
      editUser: saas.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }
}
