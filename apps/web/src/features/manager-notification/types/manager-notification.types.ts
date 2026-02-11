export type ManagerNotificationType = "mention" | "reminder" | "stale";

export interface ManagerNotification {
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
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerNotificationQueryParams {
  userId?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface ManagerNotificationsResponse {
  data: ManagerNotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManagerNotificationUnreadCountResponse {
  count: number;
}
