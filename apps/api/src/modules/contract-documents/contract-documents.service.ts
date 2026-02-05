import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractDocument as ContractDoc, ContractDocumentDocument } from "./schemas/contract-document.schema";
import {
  ContractDocumentQueryDto,
  CreateContractDocumentDto,
  UpdateContractDocumentDto,
  ContractDocumentResponseDto,
  ContractDocumentsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractDocumentsService {
  constructor(
    @InjectModel(ContractDoc.name, CONTRACT_DB_CONNECTION)
    private contractDocumentModel: Model<ContractDocumentDocument>
  ) {}

  async findAll(query: ContractDocumentQueryDto): Promise<ContractDocumentsListResponseDto> {
    const { contractId, type } = query;

    const filter: Record<string, unknown> = { contractId };
    if (type) {
      filter.type = type;
    }

    const [data, total] = await Promise.all([
      this.contractDocumentModel.find(filter).sort({ documentDate: -1 }).lean().exec(),
      this.contractDocumentModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractDocumentResponseDto> {
    const document = await this.contractDocumentModel.findOne({ id }).lean().exec();
    if (!document) {
      throw new NotFoundException(`Contract document with id ${id} not found`);
    }
    return this.mapToResponseDto(document);
  }

  async create(dto: CreateContractDocumentDto): Promise<ContractDocumentResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const document = new this.contractDocumentModel({
      ...dto,
      id,
      documentDate: dto.documentDate ? new Date(dto.documentDate) : now,
      editDate: now,
      editUser: "system"
    });

    const saved = await document.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractDocumentDto): Promise<ContractDocumentResponseDto> {
    const updateData: Record<string, unknown> = { ...dto, editDate: new Date() };
    if (dto.documentDate) {
      updateData.documentDate = new Date(dto.documentDate);
    }

    const updated = await this.contractDocumentModel
      .findOneAndUpdate(
        { id },
        updateData,
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract document with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractDocumentModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract document with id ${id} not found`);
    }
  }

  private mapToResponseDto(doc: ContractDoc): ContractDocumentResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      contractId: doc.contractId,
      description: doc.description || "",
      filename: doc.filename || "",
      type: doc.type || "",
      documentDate: doc.documentDate,
      userId: doc.userId || "",
      saleId: doc.saleId || "",
      offerId: doc.offerId || "",
      customerId: doc.customerId || "",
      licanceId: doc.licanceId || "",
      documentVersion: doc.documentVersion || "",
      editDate: doc.editDate,
      editUser: doc.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }
}
