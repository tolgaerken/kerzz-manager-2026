import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Log, LogDocument } from "./schemas/log.schema";
import {
  CreateLogDto,
  LogQueryDto,
  LogResponseDto,
  PaginatedLogsResponseDto,
} from "./dto";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateNotificationDto } from "../notifications/dto";

@Injectable()
export class LogsService {
  constructor(
    @InjectModel(Log.name)
    private logModel: Model<LogDocument>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService
  ) {}

  async create(createLogDto: CreateLogDto): Promise<LogResponseDto> {
    const id = uuidv4();
    const log = new this.logModel({
      ...createLogDto,
      id,
      mentions: createLogDto.mentions || [],
      references: createLogDto.references || [],
      reminder: createLogDto.reminder || null,
    });
    const saved = await log.save();

    // Create notifications for mentions
    if (createLogDto.mentions && createLogDto.mentions.length > 0) {
      await this.createMentionNotifications(saved, createLogDto);
    }

    // Create notification for reminder (will be handled by a scheduler in the future)
    // For now, we just store the reminder in the log

    return this.mapToResponseDto(saved);
  }

  private async createMentionNotifications(
    log: LogDocument,
    createLogDto: CreateLogDto
  ): Promise<void> {
    const notifications: CreateNotificationDto[] = createLogDto.mentions!.map(
      (mention) => ({
        userId: mention.userId,
        type: "mention" as const,
        logId: log._id.toString(),
        customerId: createLogDto.customerId,
        contextType: createLogDto.contextType,
        contextId: createLogDto.contextId,
        message: this.truncateMessage(createLogDto.message, 100),
      })
    );

    await this.notificationsService.createMany(notifications);
  }

  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  }

  async findAll(queryDto: LogQueryDto): Promise<PaginatedLogsResponseDto> {
    const { customerId, contextType, contextId, page = 1, limit = 50 } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (customerId) filter.customerId = customerId;
    if (contextType) filter.contextType = contextType;
    if (contextId) filter.contextId = contextId;

    const [data, total] = await Promise.all([
      this.logModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.logModel.countDocuments(filter).exec(),
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

  async findOne(id: string): Promise<LogResponseDto | null> {
    const log = await this.logModel.findById(id).exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async markReminderCompleted(id: string): Promise<LogResponseDto | null> {
    const log = await this.logModel
      .findByIdAndUpdate(
        id,
        { "reminder.completed": true },
        { new: true }
      )
      .exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async getPendingReminders(beforeDate: Date): Promise<LogResponseDto[]> {
    const logs = await this.logModel
      .find({
        "reminder.date": { $lte: beforeDate },
        "reminder.completed": false,
      })
      .exec();
    return logs.map((doc) => this.mapToResponseDto(doc));
  }

  private mapToResponseDto(doc: LogDocument): LogResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      customerId: doc.customerId,
      contextType: doc.contextType,
      contextId: doc.contextId,
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
