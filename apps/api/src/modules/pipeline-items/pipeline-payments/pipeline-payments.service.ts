import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  PipelinePayment,
  PipelinePaymentDocument,
} from "./schemas/pipeline-payment.schema";
import { CreatePipelinePaymentDto } from "./dto/create-pipeline-payment.dto";
import { UpdatePipelinePaymentDto } from "./dto/update-pipeline-payment.dto";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

@Injectable()
export class PipelinePaymentsService {
  constructor(
    @InjectModel(PipelinePayment.name, CONTRACT_DB_CONNECTION)
    private model: Model<PipelinePaymentDocument>
  ) {}

  async findByParent(
    parentId: string,
    parentType: string
  ): Promise<PipelinePayment[]> {
    return this.model.find({ parentId, parentType }).lean().exec();
  }

  async findOne(id: string): Promise<PipelinePayment> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Pipeline ödeme bulunamadı: ${id}`);
    return doc;
  }

  async create(dto: CreatePipelinePaymentDto): Promise<PipelinePayment> {
    const created = new this.model(dto);
    const saved = await created.save();
    return saved.toObject();
  }

  async update(
    id: string,
    dto: UpdatePipelinePaymentDto
  ): Promise<PipelinePayment> {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated)
      throw new NotFoundException(`Pipeline ödeme bulunamadı: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result)
      throw new NotFoundException(`Pipeline ödeme bulunamadı: ${id}`);
  }

  async batchUpsert(
    parentId: string,
    parentType: string,
    pipelineRef: string,
    items: Partial<CreatePipelinePaymentDto>[]
  ): Promise<PipelinePayment[]> {
    await this.model.deleteMany({ parentId, parentType }).exec();
    if (!items || items.length === 0) return [];

    const docs = items.map((item) => ({
      ...item,
      parentId,
      parentType,
      pipelineRef,
    }));

    const inserted = await this.model.insertMany(docs);
    return inserted.map((doc) => doc.toObject());
  }

  async cloneForParent(
    sourceParentId: string,
    sourceType: string,
    targetParentId: string,
    targetType: string,
    pipelineRef?: string
  ): Promise<PipelinePayment[]> {
    const sources = await this.findByParent(sourceParentId, sourceType);
    if (sources.length === 0) return [];

    const clones = sources.map((src) => {
      const { _id, createdAt, updatedAt, ...rest } = src as any;
      return {
        ...rest,
        parentId: targetParentId,
        parentType: targetType,
        isPaid: false,
        ...(pipelineRef ? { pipelineRef } : {}),
      };
    });

    const inserted = await this.model.insertMany(clones);
    return inserted.map((doc) => doc.toObject());
  }

  async deleteByParent(
    parentId: string,
    parentType: string
  ): Promise<number> {
    const result = await this.model
      .deleteMany({ parentId, parentType })
      .exec();
    return result.deletedCount;
  }
}
