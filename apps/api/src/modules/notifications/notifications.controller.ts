import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import {
  NotificationQueryDto,
  NotificationResponseDto,
  PaginatedNotificationsResponseDto,
  UnreadCountResponseDto,
} from "./dto";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Query() queryDto: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsService.findAll(queryDto);
  }

  @Get("unread-count")
  async getUnreadCount(
    @Query("userId") userId: string
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(":id/read")
  async markAsRead(
    @Param("id") id: string
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  @Patch("read-all")
  async markAllAsRead(
    @Query("userId") userId: string
  ): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.notificationsService.markAllAsRead(userId);
    return { modifiedCount };
  }
}
