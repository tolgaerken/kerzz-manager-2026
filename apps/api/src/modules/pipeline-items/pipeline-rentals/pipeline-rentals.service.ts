import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  PipelineRental,
  PipelineRentalDocument,
} from "./schemas/pipeline-rental.schema";
import { CreatePipelineRentalDto } from "./dto/create-pipeline-rental.dto";
import { UpdatePipelineRentalDto } from "./dto/update-pipeline-rental.dto";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

@Injectable()
export class PipelineRentalsService {
  constructor(
    @InjectModel(PipelineRental.name, CONTRACT_DB_CONNECTION)
    private model: Model<PipelineRentalDocument>
  ) {}

  async findByParent(
    parentId: string,
    parentType: string
  ): Promise<PipelineRental[]> {
    return this.model.find({ parentId, parentType }).lean().exec();
  }

  async findOne(id: string): Promise<PipelineRental> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc)
      throw new NotFoundException(`Pipeline kiralama bulunamadı: ${id}`);
    return doc;
  }

  async create(dto: CreatePipelineRentalDto): Promise<PipelineRental> {
    const created = new this.model(dto);
    const saved = await created.save();
    return saved.toObject();
  }

  async update(
    id: string,
    dto: UpdatePipelineRentalDto
  ): Promise<PipelineRental> {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated)
      throw new NotFoundException(`Pipeline kiralama bulunamadı: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result)
      throw new NotFoundException(`Pipeline kiralama bulunamadı: ${id}`);
  }

  async batchUpsert(
    parentId: string,
    parentType: string,
    pipelineRef: string,
    items: Partial<CreatePipelineRentalDto>[]
  ): Promise<PipelineRental[]> {
    await this.model.deleteMany({ parentId, parentType }).exec();
    if (!items || items.length === 0) return [];

    // _id temizlenerek — frontend geçici ID gönderebilir
    const docs = items.map((item) => {
      const { _id, ...rest } = item as any;
      return {
        ...rest,
        parentId,
        parentType,
        pipelineRef,
      };
    });

    const inserted = await this.model.insertMany(docs);
    return inserted.map((doc) => doc.toObject());
  }

  async cloneForParent(
    sourceParentId: string,
    sourceType: string,
    targetParentId: string,
    targetType: string,
    pipelineRef?: string
  ): Promise<PipelineRental[]> {
    const sources = await this.findByParent(sourceParentId, sourceType);
    if (sources.length === 0) return [];

    const clones = sources.map((src) => {
      const { _id, createdAt, updatedAt, ...rest } = src as any;
      return {
        ...rest,
        parentId: targetParentId,
        parentType: targetType,
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

  async aggregateTotal(parentIds: string[]): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { parentId: { $in: parentIds }, parentType: "sale" } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);
    return result[0]?.total || 0;
  }
}
