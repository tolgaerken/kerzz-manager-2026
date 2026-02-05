import { NotificationType } from "../schemas/notification.schema";

export class NotificationResponseDto {
  _id: string;
  id: string;
  userId: string;
  type: NotificationType;
  logId: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedNotificationsResponseDto {
  data: NotificationResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UnreadCountResponseDto {
  count: number;
}
