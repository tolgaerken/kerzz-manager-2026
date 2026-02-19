import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ContractVersion, ContractVersionDocument } from "./schemas/contract-version.schema";
import {
  ContractVersionQueryDto,
  CreateContractVersionDto,
  UpdateContractVersionDto,
  ContractVersionResponseDto,
  ContractVersionsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";
import { VERSION_DESCRIPTION } from "../contract-payments/constants/invoice.constants";
import { ErpSettingsService } from "../erp-settings";

@Injectable()
export class ContractVersionsService {
  constructor(
    @InjectModel(ContractVersion.name, CONTRACT_DB_CONNECTION)
    private contractVersionModel: Model<ContractVersionDocument>,
    private readonly proratedPlanService: ProratedPlanService,
    private readonly erpSettingsService: ErpSettingsService,
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
    const version = await this.findByIdentifier(id);
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
      enabled: true,
      expired: false,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      activated: false,
      editDate: now,
      editUser: "system"
    });

    const saved = await version.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractVersionDto): Promise<ContractVersionResponseDto> {
    const filter = await this.resolveFilter(id);
    // activated true geldiyse aktivasyon mantığını çalıştır
    if (dto.activated === true) {
      const existing = await this.contractVersionModel.findOne(filter).lean().exec();
      if (!existing) {
        throw new NotFoundException(`Contract version with id ${id} not found`);
      }
      if (!existing.activated) {
        return this.activate(id);
      }
    }

    // activated false geldiyse: faturalanmamis kist planini sil
    if (dto.activated === false) {
      const existing = await this.contractVersionModel.findOne(filter).lean().exec();
      if (existing?.activated) {
        await this.proratedPlanService.deleteUninvoicedBySourceItem(existing.contractId, existing.id);
      }
    }

    const updated = await this.contractVersionModel
      .findOneAndUpdate(
        filter,
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
    const filter = await this.resolveFilter(id);
    // Silmeden once kalemi bul (contractId icin)
    const item = await this.contractVersionModel.findOne(filter).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
    }

    // Faturalanmamis kist plani sil
    await this.proratedPlanService.deleteUninvoicedBySourceItem(item.contractId, item.id);

    // Kalemi sil
    await this.contractVersionModel.deleteOne(filter).exec();
  }

  /**
   * Kalemi aktive eder (kuruldu/devreye alindi).
   */
  async activate(id: string): Promise<ContractVersionResponseDto> {
    const filter = await this.resolveFilter(id);
    const item = await this.contractVersionModel.findOne(filter).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
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

    const updated = await this.contractVersionModel
      .findOneAndUpdate(filter, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract version with id ${id} not found`);
    }

    const startDate = (updateData.startDate as Date) || item.startDate;
    if (new Date(startDate).getUTCDate() !== 1) {
      await this.proratedPlanService.createProratedPlan(
        item.contractId,
        {
          price: item.price,
          currency: item.currency,
          startDate: new Date(startDate),
          sourceItemId: item.id,
          itemId: this.erpSettingsService.getErpId("version"),
        },
        VERSION_DESCRIPTION,
      );
    }

    return this.mapToResponseDto(updated);
  }

  private async findByIdentifier(identifier: string) {
    const byId = await this.contractVersionModel.findOne({ id: identifier }).lean().exec();
    if (byId) return byId;

    if (Types.ObjectId.isValid(identifier)) {
      return this.contractVersionModel.findOne({ _id: identifier }).lean().exec();
    }

    return null;
  }

  private async resolveFilter(identifier: string): Promise<Record<string, unknown>> {
    const byId = await this.contractVersionModel.exists({ id: identifier });
    if (byId) return { id: identifier };

    if (Types.ObjectId.isValid(identifier)) {
      const byObjectId = await this.contractVersionModel.exists({ _id: identifier });
      if (byObjectId) return { _id: identifier };
    }

    return { id: identifier };
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
      startDate: version.startDate,
      activated: version.activated || false,
      activatedAt: version.activatedAt,
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
