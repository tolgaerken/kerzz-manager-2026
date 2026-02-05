import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractCashRegister, ContractCashRegisterDocument } from "./schemas/contract-cash-register.schema";
import {
  ContractCashRegisterQueryDto,
  CreateContractCashRegisterDto,
  UpdateContractCashRegisterDto,
  ContractCashRegisterResponseDto,
  ContractCashRegistersListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractCashRegistersService {
  constructor(
    @InjectModel(ContractCashRegister.name, CONTRACT_DB_CONNECTION)
    private contractCashRegisterModel: Model<ContractCashRegisterDocument>
  ) {}

  async findAll(query: ContractCashRegisterQueryDto): Promise<ContractCashRegistersListResponseDto> {
    const { contractId, enabled, type } = query;

    const filter: Record<string, unknown> = { contractId };
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }
    if (type) {
      filter.type = type;
    }

    const [data, total] = await Promise.all([
      this.contractCashRegisterModel.find(filter).lean().exec(),
      this.contractCashRegisterModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractCashRegisterResponseDto> {
    const cashRegister = await this.contractCashRegisterModel.findOne({ id }).lean().exec();
    if (!cashRegister) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }
    return this.mapToResponseDto(cashRegister);
  }

  async create(dto: CreateContractCashRegisterDto): Promise<ContractCashRegisterResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const cashRegister = new this.contractCashRegisterModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await cashRegister.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractCashRegisterDto): Promise<ContractCashRegisterResponseDto> {
    const updated = await this.contractCashRegisterModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractCashRegisterModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }
  }

  private mapToResponseDto(cr: ContractCashRegister): ContractCashRegisterResponseDto {
    return {
      _id: cr._id.toString(),
      id: cr.id,
      contractId: cr.contractId,
      brand: cr.brand || "",
      licanceId: cr.licanceId || "",
      legalId: cr.legalId || "",
      model: cr.model || "",
      type: cr.type || "gmp",
      price: cr.price || 0,
      old_price: cr.old_price || 0,
      currency: cr.currency || "tl",
      yearly: cr.yearly || false,
      enabled: cr.enabled ?? true,
      expired: cr.expired || false,
      eftPosActive: cr.eftPosActive || false,
      folioClose: cr.folioClose || false,
      editDate: cr.editDate,
      editUser: cr.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }
}
