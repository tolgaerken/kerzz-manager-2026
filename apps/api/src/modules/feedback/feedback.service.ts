import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
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
    // Sadece root feedback'leri getir (parentId null veya yok)
    const conditions: Record<string, unknown>[] = [
      { $or: [{ parentId: null }, { parentId: { $exists: false } }] },
    ];

    if (query.status && query.status !== "all") {
      conditions.push({ status: query.status });
    }
    if (query.priority && query.priority !== "all") {
      conditions.push({ priority: query.priority });
    }
    if (query.search) {
      conditions.push({
        $or: [
          { title: { $regex: query.search, $options: "i" } },
          { description: { $regex: query.search, $options: "i" } },
          { createdByName: { $regex: query.search, $options: "i" } },
        ],
      });
    }

    const filter = { $and: conditions };

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

    // Her root feedback için replyCount hesapla
    const feedbackIds = data.map((d) => d.id);
    const replyCounts = await this.getReplyCountsForFeedbacks(feedbackIds);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => ({
        ...this.toResponse(doc),
        replyCount: replyCounts.get(doc.id) || 0,
      })),
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

  /**
   * Belirli bir feedback'in tüm yanıtlarını (flat list) getirir
   */
  async findReplies(feedbackId: string): Promise<FeedbackResponseDto[]> {
    // Önce parent feedback'in var olduğunu doğrula
    const parent = await this.model.findOne({ id: feedbackId }).lean().exec();
    if (!parent) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${feedbackId}`);
    }

    // Tüm yanıtları recursive olarak getir
    const allReplies = await this.getAllRepliesRecursive(feedbackId);
    return allReplies.map((doc) => this.toResponse(doc));
  }

  /**
   * Recursive olarak tüm yanıtları getirir (nested replies dahil)
   */
  private async getAllRepliesRecursive(
    parentId: string,
  ): Promise<FeedbackDocument[]> {
    const directReplies = await this.model
      .find({ parentId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const allReplies: FeedbackDocument[] = [...directReplies];

    for (const reply of directReplies) {
      const nestedReplies = await this.getAllRepliesRecursive(reply.id);
      allReplies.push(...nestedReplies);
    }

    return allReplies;
  }

  /**
   * Birden fazla feedback için reply count hesaplar
   */
  private async getReplyCountsForFeedbacks(
    feedbackIds: string[],
  ): Promise<Map<string, number>> {
    if (feedbackIds.length === 0) {
      return new Map();
    }

    // Her feedback için recursive reply count hesapla
    const counts = new Map<string, number>();

    for (const feedbackId of feedbackIds) {
      const count = await this.countAllReplies(feedbackId);
      counts.set(feedbackId, count);
    }

    return counts;
  }

  /**
   * Bir feedback'in tüm yanıtlarını (nested dahil) sayar
   */
  private async countAllReplies(feedbackId: string): Promise<number> {
    const directReplies = await this.model
      .find({ parentId: feedbackId })
      .select("id")
      .lean()
      .exec();

    let total = directReplies.length;

    for (const reply of directReplies) {
      total += await this.countAllReplies(reply.id);
    }

    return total;
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
    const description = this.sanitizeDescription(dto.description);

    let title = dto.title || "";
    const isReply = !!dto.parentId;

    // parentId varsa, parent'ın varlığını doğrula ve title'ını al
    if (dto.parentId) {
      const parent = await this.model
        .findOne({ id: dto.parentId })
        .lean()
        .exec();
      if (!parent) {
        throw new BadRequestException(
          `Üst geribildirim bulunamadı: ${dto.parentId}`,
        );
      }
      // Reply için parent'ın title'ını kullan
      title = parent.title;
    }

    // Root feedback ise title zorunlu
    if (!isReply && !dto.title?.trim()) {
      throw new BadRequestException("Başlık zorunludur");
    }

    const record = new this.model({
      ...dto,
      id,
      title,
      description,
      screenshots: dto.screenshots || [],
      priority: dto.priority || "medium",
      status: "open",
      parentId: dto.parentId || null,
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
    const updatePayload: UpdateFeedbackDto = {
      ...dto,
      ...(dto.description !== undefined
        ? { description: this.sanitizeDescription(dto.description) }
        : {}),
    };

    const updated = await this.model
      .findOneAndUpdate({ id }, updatePayload, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${id}`);
    }

    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const doc = await this.model.findOne({ id }).lean().exec();
    if (!doc) {
      throw new NotFoundException(`Geribildirim bulunamadı: ${id}`);
    }

    // Recursive olarak tüm yanıtları sil
    await this.deleteRepliesRecursive(id);

    // Kendisini sil
    await this.model.deleteOne({ id }).exec();
  }

  /**
   * Bir feedback'in tüm yanıtlarını recursive olarak siler
   */
  private async deleteRepliesRecursive(parentId: string): Promise<void> {
    const replies = await this.model
      .find({ parentId })
      .select("id")
      .lean()
      .exec();

    for (const reply of replies) {
      await this.deleteRepliesRecursive(reply.id);
      await this.model.deleteOne({ id: reply.id }).exec();
    }
  }

  private toResponse(doc: FeedbackDocument | object): FeedbackResponseDto {
    const d = doc as FeedbackDocument;
    return {
      _id: d._id?.toString() ?? "",
      id: d.id ?? "",
      title: d.title ?? "",
      description: d.description ?? "",
      screenshots: Array.isArray(d.screenshots) ? d.screenshots : [],
      priority: d.priority ?? "medium",
      status: d.status ?? "open",
      createdBy: d.createdBy ?? "",
      createdByName: d.createdByName ?? "",
      parentId: d.parentId ?? null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }

  private sanitizeDescription(description: string): string {
    return description
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }
}
