import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ContractUser, ContractUserDocument } from "./schemas/contract-user.schema";
import { ContractUserQueryDto } from "./dto/contract-user-query.dto";
import { CreateContractUserDto } from "./dto/create-contract-user.dto";
import { UpdateContractUserDto } from "./dto/update-contract-user.dto";
import {
  ContractUserResponseDto,
  ContractUsersListResponseDto
} from "./dto/contract-user-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractUsersService {
  constructor(
    @InjectModel(ContractUser.name, CONTRACT_DB_CONNECTION)
    private contractUserModel: Model<ContractUserDocument>
  ) {}

  async findAll(query: ContractUserQueryDto): Promise<ContractUsersListResponseDto> {
    const { contractId, role } = query;

    const filter: Record<string, unknown> = { contractId };
    if (role) {
      filter.role = role;
    }

    const [data, total] = await Promise.all([
      this.contractUserModel.find(filter).lean().exec(),
      this.contractUserModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractUserResponseDto> {
    const user = await this.findByIdentifier(id);
    if (!user) {
      throw new NotFoundException(`Contract user with id ${id} not found`);
    }
    return this.mapToResponseDto(user);
  }

  async create(dto: CreateContractUserDto): Promise<ContractUserResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const user = new this.contractUserModel({
      ...dto,
      id,
      editDate: now,
      editUser: "system"
    });

    const saved = await user.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractUserDto): Promise<ContractUserResponseDto> {
    const filter = await this.resolveFilter(id);
    const updated = await this.contractUserModel
      .findOneAndUpdate(
        filter,
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract user with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const filter = await this.resolveFilter(id);
    const result = await this.contractUserModel.deleteOne(filter).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract user with id ${id} not found`);
    }
  }

  private mapToResponseDto(user: ContractUser): ContractUserResponseDto {
    return {
      _id: user._id.toString(),
      id: user.id,
      contractId: user.contractId,
      email: user.email || "",
      gsm: user.gsm || "",
      name: user.name || "",
      role: user.role || "",
      editDate: user.editDate,
      editUser: user.editUser || ""
    };
  }

  private async findByIdentifier(identifier: string) {
    const byId = await this.contractUserModel.findOne({ id: identifier }).lean().exec();
    if (byId) return byId;

    if (Types.ObjectId.isValid(identifier)) {
      return this.contractUserModel.findOne({ _id: identifier }).lean().exec();
    }

    return null;
  }

  private async resolveFilter(identifier: string): Promise<Record<string, unknown>> {
    const byId = await this.contractUserModel.exists({ id: identifier });
    if (byId) return { id: identifier };

    if (Types.ObjectId.isValid(identifier)) {
      const byObjectId = await this.contractUserModel.exists({ _id: identifier });
      if (byObjectId) return { _id: identifier };
    }

    return { id: identifier };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
