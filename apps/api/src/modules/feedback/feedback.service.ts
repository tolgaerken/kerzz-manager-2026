import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Feedback, FeedbackDocument } from "./schemas/feedback.schema";
import {
  CreateFeedbackDto,
  FeedbackQueryDto,
  FeedbackResponseDto,
  FeedbackListResponseDto,
  UpdateFeedbackDto,
} from "./dto";

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly model: Model<FeedbackDocument>,
  ) {}

  async findAll(query: FeedbackQueryDto): Promise<FeedbackListResponseDto> {
    const filter: Record<string, unknown> = {};

    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }
    if (query.priority && query.priority !== "all") {
      filter.priority = query.priority;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
        { createdByName: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const sortField = query.sortField || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.toResponse(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<FeedbackResponseDto> {
    const doc = await this.model.findOne({ id }).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${id}`);
    }
    return this.toResponse(doc);
  }

  async create(
    dto: CreateFeedbackDto,
    userId: string,
    userName: string,
  ): Promise<FeedbackResponseDto> {
    const id = this.generateId();

    const record = new this.model({
      ...dto,
      id,
      priority: dto.priority || "medium",
      status: "open",
      createdBy: userId,
      createdByName: userName,
    });

    const saved = await record.save();
    return this.toResponse(saved.toObject());
  }

  async update(
    id: string,
    dto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    const updated = await this.model
      .findOneAndUpdate({ id }, dto, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${id}`);
    }

    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${id}`);
    }
  }

  private toResponse(doc: FeedbackDocument | object): FeedbackResponseDto {
    const d = doc as FeedbackDocument;
    return {
      _id: d._id?.toString() ?? "",
      id: d.id ?? "",
      title: d.title ?? "",
      description: d.description ?? "",
      priority: d.priority ?? "medium",
      status: d.status ?? "open",
      createdBy: d.createdBy ?? "",
      createdByName: d.createdByName ?? "",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
