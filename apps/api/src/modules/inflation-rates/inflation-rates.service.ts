import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import {
  InflationRate,
  InflationRateDocument,
} from "./schemas/inflation-rate.schema";
import {
  CreateInflationRateDto,
  InflationRateQueryDto,
  InflationRateResponseDto,
  InflationRatesListResponseDto,
  UpdateInflationRateDto,
} from "./dto";

@Injectable()
export class InflationRatesService {
  constructor(
    @InjectModel(InflationRate.name, HELPERS_DB_CONNECTION)
    private readonly model: Model<InflationRateDocument>,
  ) {}

  async findAll(
    query: InflationRateQueryDto,
  ): Promise<InflationRatesListResponseDto> {
    const filter: Record<string, unknown> = {};

    if (query.country) {
      filter.country = query.country;
    }
    if (query.year !== undefined) {
      filter.year = query.year;
    }
    if (query.month !== undefined) {
      filter.month = query.month;
    }
    if (query.search) {
      filter.$or = [
        { country: { $regex: query.search, $options: "i" } },
        { year: Number(query.search) || -1 },
      ];
    }

    const sortField = query.sortField || "date";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ [sortField]: sortOrder }).lean().exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((doc) => this.toResponse(doc)),
      total,
    };
  }

  async findOne(id: string): Promise<InflationRateResponseDto> {
    const doc = await this.findByIdFlexible(id);
    if (!doc) {
      throw new NotFoundException(`Enflasyon kaydı bulunamadı: ${id}`);
    }
    return this.toResponse(doc);
  }

  async create(dto: CreateInflationRateDto): Promise<InflationRateResponseDto> {
    const id = this.generateId();
    const averages = this.calculateAverages(
      dto.consumer,
      dto.producer,
      dto.monthlyConsumer,
      dto.monthlyProducer,
    );

    const record = new this.model({
      ...dto,
      id,
      date: new Date(dto.date),
      average: averages.average,
      monthlyAverage: averages.monthlyAverage,
    });

    const saved = await record.save();
    return this.toResponse(saved.toObject());
  }

  async update(
    id: string,
    dto: UpdateInflationRateDto,
  ): Promise<InflationRateResponseDto> {
    const existing = await this.findByIdFlexible(id);
    if (!existing) {
      throw new NotFoundException(`Enflasyon kaydı bulunamadı: ${id}`);
    }

    const mergedConsumer = dto.consumer ?? existing.consumer;
    const mergedProducer = dto.producer ?? existing.producer;
    const mergedMonthlyConsumer = dto.monthlyConsumer ?? existing.monthlyConsumer;
    const mergedMonthlyProducer = dto.monthlyProducer ?? existing.monthlyProducer;

    const averages = this.calculateAverages(
      mergedConsumer,
      mergedProducer,
      mergedMonthlyConsumer,
      mergedMonthlyProducer,
    );

    const updateData: Record<string, unknown> = {
      ...dto,
      average: averages.average,
      monthlyAverage: averages.monthlyAverage,
    };

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    const updated = await this.model
      .findOneAndUpdate({ id: existing.id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Enflasyon kaydı bulunamadı: ${id}`);
    }

    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findByIdFlexible(id);
    if (!existing) {
      throw new NotFoundException(`Enflasyon kaydı bulunamadı: ${id}`);
    }

    const result = await this.model.deleteOne({ id: existing.id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Enflasyon kaydı bulunamadı: ${id}`);
    }
  }

  private async findByIdFlexible(id: string) {
    const byExactId = await this.model.findOne({ id }).lean().exec();
    if (byExactId) {
      return byExactId;
    }

    const escapedId = this.escapeRegex(id);
    const byCaseInsensitiveExactId = await this.model
      .findOne({ id: { $regex: `^${escapedId}$`, $options: "i" } })
      .lean()
      .exec();
    if (byCaseInsensitiveExactId) {
      return byCaseInsensitiveExactId;
    }

    const byStringifiedMongoId = await this.model
      .findOne({
        $expr: { $eq: [{ $toString: "$_id" }, id] },
      })
      .lean()
      .exec();
    if (byStringifiedMongoId) {
      return byStringifiedMongoId;
    }

    const baseUuid = this.extractBaseUuid(id);
    if (!baseUuid) {
      return null;
    }

    const escapedBaseUuid = this.escapeRegex(baseUuid);
    return this.model
      .findOne({
        id: {
          $regex: `^${escapedBaseUuid}.*$`,
          $options: "i",
        },
      })
      .lean()
      .exec();
  }

  private extractBaseUuid(value: string): string | null {
    const uuidMatch = value.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    );

    return uuidMatch?.[0] ?? null;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private calculateAverages(
    consumer: number,
    producer: number,
    monthlyConsumer: number,
    monthlyProducer: number,
  ): { average: number; monthlyAverage: number } {
    const average = Number(((consumer + producer) / 2).toFixed(2));
    const monthlyAverage = Number(
      ((monthlyConsumer + monthlyProducer) / 2).toFixed(2),
    );

    return { average, monthlyAverage };
  }

  private toResponse(doc: any): InflationRateResponseDto {
    return {
      _id: doc._id?.toString() ?? "",
      id: doc.id ?? "",
      country: doc.country ?? "tr",
      year: doc.year ?? 0,
      month: doc.month ?? 0,
      date: doc.date ? new Date(doc.date) : new Date(0),
      consumer: doc.consumer ?? 0,
      producer: doc.producer ?? 0,
      average: doc.average ?? 0,
      monthlyConsumer: doc.monthlyConsumer ?? 0,
      monthlyProducer: doc.monthlyProducer ?? 0,
      monthlyAverage: doc.monthlyAverage ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
