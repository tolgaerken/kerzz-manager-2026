import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  ManagerNotification,
  ManagerNotificationDocument,
} from "./schemas/manager-notification.schema";
import {
  ManagerNotificationQueryDto,
  ManagerNotificationResponseDto,
  PaginatedManagerNotificationsResponseDto,
  CreateManagerNotificationDto,
} from "./dto";

@Injectable()
export class ManagerNotificationService {
  constructor(
    @InjectModel(ManagerNotification.name)
    private managerNotificationModel: Model<ManagerNotificationDocument>
  ) {}

  async create(
    createManagerNotificationDto: CreateManagerNotificationDto
  ): Promise<ManagerNotificationResponseDto> {
    const id = uuidv4();
    const notification = new this.managerNotificationModel({
      ...createManagerNotificationDto,
      id,
      read: false,
    });
    const saved = await notification.save();
    return this.mapToResponseDto(saved);
  }

  async createMany(
    notifications: CreateManagerNotificationDto[]
  ): Promise<ManagerNotificationResponseDto[]> {
    const docs = notifications.map((dto) => ({
      ...dto,
      id: uuidv4(),
      read: false,
    }));
    const saved = await this.managerNotificationModel.insertMany(docs);
    return saved.map((doc) => this.mapToResponseDto(doc as ManagerNotificationDocument));
  }

  async findAll(
    queryDto: ManagerNotificationQueryDto
  ): Promise<PaginatedManagerNotificationsResponseDto> {
    const { userId, read, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;
    if (read !== undefined) filter.read = read;

    const [data, total] = await Promise.all([
      this.managerNotificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.managerNotificationModel.countDocuments(filter).exec(),
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
    return this.managerNotificationModel.countDocuments({ userId, read: false }).exec();
  }

  async markAsRead(id: string): Promise<ManagerNotificationResponseDto | null> {
    const notification = await this.managerNotificationModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec();
    return notification ? this.mapToResponseDto(notification) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.managerNotificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();
    return result.modifiedCount;
  }

  private mapToResponseDto(doc: ManagerNotificationDocument): ManagerNotificationResponseDto {
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
      pipelineRef: doc.pipelineRef,
      read: doc.read,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
