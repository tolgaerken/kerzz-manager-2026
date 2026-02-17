import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { ManagerNotificationService } from "./manager-notification.service";
import {
  ManagerNotificationQueryDto,
  ManagerNotificationResponseDto,
  PaginatedManagerNotificationsResponseDto,
  ManagerNotificationUnreadCountResponseDto,
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("manager-notifications")
export class ManagerNotificationController {
  constructor(private readonly managerNotificationService: ManagerNotificationService) {}

  @Get()
  async findAll(
    @Query() queryDto: ManagerNotificationQueryDto
  ): Promise<PaginatedManagerNotificationsResponseDto> {
    return this.managerNotificationService.findAll(queryDto);
  }

  @Get("unread-count")
  async getUnreadCount(
    @Query("userId") userId: string
  ): Promise<ManagerNotificationUnreadCountResponseDto> {
    const count = await this.managerNotificationService.getUnreadCount(userId);
    return { count };
  }

  @AuditLog({ module: "manager-notifications", entityType: "ManagerNotification" })
  @Patch(":id/read")
  async markAsRead(
    @Param("id") id: string
  ): Promise<ManagerNotificationResponseDto> {
    const notification = await this.managerNotificationService.markAsRead(id);
    if (!notification) {
      throw new NotFoundException(`ManagerNotification with ID ${id} not found`);
    }
    return notification;
  }

  @AuditLog({ module: "manager-notifications", entityType: "ManagerNotification" })
  @Patch("read-all")
  async markAllAsRead(
    @Query("userId") userId: string
  ): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.managerNotificationService.markAllAsRead(userId);
    return { modifiedCount };
  }
}
