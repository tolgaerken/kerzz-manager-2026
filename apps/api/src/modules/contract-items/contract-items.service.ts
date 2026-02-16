import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";

@Injectable()
export class ContractItemsService {
  constructor(
    @InjectModel(ContractItem.name, CONTRACT_DB_CONNECTION)
    private contractItemModel: Model<ContractItemDocument>,
    private readonly proratedPlanService: ProratedPlanService,
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
      enabled: true,
      expired: false,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      activated: false,
      editDate: now,
      editUser: "system"
    });

    const saved = await item.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractItemDto): Promise<ContractItemResponseDto> {
    // activated true geldiyse aktivasyon mantığını çalıştır
    if (dto.activated === true) {
      const existing = await this.contractItemModel.findOne({ id }).lean().exec();
      if (!existing) {
        throw new NotFoundException(`Contract item with id ${id} not found`);
      }
      if (!existing.activated) {
        return this.activate(id);
      }
    }

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

  /**
   * Kalemi aktive eder (kuruldu/devreye alindi).
   */
  async activate(id: string): Promise<ContractItemResponseDto> {
    const item = await this.contractItemModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract item with id ${id} not found`);
    }
    if (item.activated) {
      throw new BadRequestException("Bu kalem zaten aktive edilmis");
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {
      activated: true,
      activatedAt: now,
      editDate: now,
    };

    if (!item.startDate) {
      updateData.startDate = now;
    }

    const updated = await this.contractItemModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract item with id ${id} not found`);
    }

    const startDate = (updateData.startDate as Date) || item.startDate;
    if (new Date(startDate).getUTCDate() !== 1) {
      await this.proratedPlanService.createProratedPlan(
        item.contractId,
        {
          price: item.price,
          currency: item.currency,
          startDate: new Date(startDate),
          qty: item.qty,
        },
        item.description || "Kontrat Kalemi",
      );
    }

    return this.mapToResponseDto(updated);
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
      startDate: item.startDate,
      activated: item.activated || false,
      activatedAt: item.activatedAt,
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
