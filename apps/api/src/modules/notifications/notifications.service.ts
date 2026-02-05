import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  Notification,
  NotificationDocument,
} from "./schemas/notification.schema";
import {
  NotificationQueryDto,
  NotificationResponseDto,
  PaginatedNotificationsResponseDto,
  CreateNotificationDto,
} from "./dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<NotificationResponseDto> {
    const id = uuidv4();
    const notification = new this.notificationModel({
      ...createNotificationDto,
      id,
      read: false,
    });
    const saved = await notification.save();
    return this.mapToResponseDto(saved);
  }

  async createMany(
    notifications: CreateNotificationDto[]
  ): Promise<NotificationResponseDto[]> {
    const docs = notifications.map((dto) => ({
      ...dto,
      id: uuidv4(),
      read: false,
    }));
    const saved = await this.notificationModel.insertMany(docs);
    return saved.map((doc) => this.mapToResponseDto(doc as NotificationDocument));
  }

  async findAll(
    queryDto: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponseDto> {
    const { userId, read, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;
    if (read !== undefined) filter.read = read;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter).exec(),
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

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false }).exec();
  }

  async markAsRead(id: string): Promise<NotificationResponseDto | null> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec();
    return notification ? this.mapToResponseDto(notification) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();
    return result.modifiedCount;
  }

  private mapToResponseDto(doc: NotificationDocument): NotificationResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      userId: doc.userId,
      type: doc.type,
      logId: doc.logId,
      customerId: doc.customerId,
      contextType: doc.contextType,
      contextId: doc.contextId,
      message: doc.message,
      read: doc.read,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
