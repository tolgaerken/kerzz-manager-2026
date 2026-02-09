import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ManagerLog, ManagerLogDocument } from "./schemas/manager-log.schema";
import {
  CreateManagerLogDto,
  ManagerLogQueryDto,
  ManagerLogResponseDto,
  PaginatedManagerLogsResponseDto,
  PipelineLogsResponseDto,
} from "./dto";
import { ManagerNotificationService } from "../manager-notification/manager-notification.service";
import { CreateManagerNotificationDto } from "../manager-notification/dto";

@Injectable()
export class ManagerLogService {
  constructor(
    @InjectModel(ManagerLog.name)
    private managerLogModel: Model<ManagerLogDocument>,
    @Inject(forwardRef(() => ManagerNotificationService))
    private managerNotificationService: ManagerNotificationService
  ) {}

  async create(createManagerLogDto: CreateManagerLogDto): Promise<ManagerLogResponseDto> {
    const id = uuidv4();
    const log = new this.managerLogModel({
      ...createManagerLogDto,
      id,
      mentions: createManagerLogDto.mentions || [],
      references: createManagerLogDto.references || [],
      reminder: createManagerLogDto.reminder || null,
    });
    const saved = await log.save();

    // Create notifications for mentions
    if (createManagerLogDto.mentions && createManagerLogDto.mentions.length > 0) {
      await this.createMentionNotifications(saved, createManagerLogDto);
    }

    // Create notification for reminder (will be handled by a scheduler in the future)
    // For now, we just store the reminder in the log

    return this.mapToResponseDto(saved);
  }

  private async createMentionNotifications(
    log: ManagerLogDocument,
    createManagerLogDto: CreateManagerLogDto
  ): Promise<void> {
    const notifications: CreateManagerNotificationDto[] = createManagerLogDto.mentions!.map(
      (mention) => ({
        userId: mention.userId,
        type: "mention" as const,
        logId: log._id.toString(),
        customerId: createManagerLogDto.customerId,
        contextType: createManagerLogDto.contextType,
        contextId: createManagerLogDto.contextId,
        message: this.truncateMessage(createManagerLogDto.message, 100),
      })
    );

    await this.managerNotificationService.createMany(notifications);
  }

  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  }

  async findAll(queryDto: ManagerLogQueryDto): Promise<PaginatedManagerLogsResponseDto> {
    const { customerId, contextType, contextId, page = 1, limit = 50 } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (customerId) filter.customerId = customerId;
    if (contextType) filter.contextType = contextType;
    if (contextId) filter.contextId = contextId;

    const [data, total] = await Promise.all([
      this.managerLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.managerLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ManagerLogResponseDto | null> {
    const log = await this.managerLogModel.findById(id).exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async markReminderCompleted(id: string): Promise<ManagerLogResponseDto | null> {
    const log = await this.managerLogModel
      .findByIdAndUpdate(
        id,
        { "reminder.completed": true },
        { new: true }
      )
      .exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async getPendingReminders(beforeDate: Date): Promise<ManagerLogResponseDto[]> {
    const logs = await this.managerLogModel
      .find({
        "reminder.date": { $lte: beforeDate },
        "reminder.completed": false,
      })
      .exec();
    return logs.map((doc) => this.mapToResponseDto(doc));
  }

  async findByPipeline(pipelineRef: string): Promise<PipelineLogsResponseDto> {
    const logs = await this.managerLogModel
      .find({ pipelineRef })
      .sort({ createdAt: 1 })
      .exec();

    const grouped: PipelineLogsResponseDto = {
      pipelineRef,
      lead: [],
      offer: [],
      sale: [],
    };

    for (const log of logs) {
      const dto = this.mapToResponseDto(log);
      if (log.contextType === "lead") {
        grouped.lead.push(dto);
      } else if (log.contextType === "offer") {
        grouped.offer.push(dto);
      } else if (log.contextType === "sale") {
        grouped.sale.push(dto);
      }
    }

    return grouped;
  }

  private mapToResponseDto(doc: ManagerLogDocument): ManagerLogResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      customerId: doc.customerId,
      contextType: doc.contextType,
      contextId: doc.contextId,
      pipelineRef: doc.pipelineRef,
      message: doc.message,
      mentions: doc.mentions || [],
      references: doc.references || [],
      reminder: doc.reminder,
      authorId: doc.authorId,
      authorName: doc.authorName,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
