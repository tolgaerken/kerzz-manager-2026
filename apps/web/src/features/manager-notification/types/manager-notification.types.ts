export type ManagerNotificationType = "mention" | "reminder";

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
