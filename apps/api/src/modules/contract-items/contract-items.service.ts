import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractItem, ContractItemDocument } from "./schemas/contract-item.schema";
import {
  ContractItemQueryDto,
  CreateContractItemDto,
  UpdateContractItemDto,
  ContractItemResponseDto,
  ContractItemsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractItemsService {
  constructor(
    @InjectModel(ContractItem.name, CONTRACT_DB_CONNECTION)
    private contractItemModel: Model<ContractItemDocument>
  ) {}

  async findAll(query: ContractItemQueryDto): Promise<ContractItemsListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = { contractId };
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractItemModel.find(filter).lean().exec(),
      this.contractItemModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractItemResponseDto> {
    const item = await this.contractItemModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract item with id ${id} not found`);
    }
    return this.mapToResponseDto(item);
  }

  async create(dto: CreateContractItemDto): Promise<ContractItemResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const item = new this.contractItemModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await item.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractItemDto): Promise<ContractItemResponseDto> {
    const updated = await this.contractItemModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract item with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractItemModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract item with id ${id} not found`);
    }
  }

  private mapToResponseDto(item: ContractItem): ContractItemResponseDto {
    return {
      _id: item._id.toString(),
      id: item.id,
      contractId: item.contractId,
      itemId: item.itemId || "",
      description: item.description || "",
      price: item.price || 0,
      old_price: item.old_price || 0,
      qty: item.qty || 1,
      qtyDynamic: item.qtyDynamic || false,
      currency: item.currency || "tl",
      yearly: item.yearly || false,
      enabled: item.enabled ?? true,
      expired: item.expired || false,
      erpId: item.erpId || "",
      editDate: item.editDate,
      editUser: item.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
