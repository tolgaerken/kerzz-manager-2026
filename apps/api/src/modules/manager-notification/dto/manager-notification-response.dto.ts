import { ManagerNotificationType } from "../schemas/manager-notification.schema";

export class ManagerNotificationResponseDto {
  _id: string;
  id: string;
  userId: string;
  type: ManagerNotificationType;
  logId: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  pipelineRef?: string;
  customerName?: string;
  contextLabel?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedManagerNotificationsResponseDto {
  data: ManagerNotificationResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ManagerNotificationUnreadCountResponseDto {
  count: number;
}
