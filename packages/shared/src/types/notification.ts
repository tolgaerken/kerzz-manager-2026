/**
 * Manager notification types shared between web and mobile
 */

export interface ManagerNotification {
  _id: string;
  userId: string;
  logId: string;
  mentionedBy: {
    id: string;
    name: string;
  };
  message: string;
  entityType: "customer" | "contract" | "license";
  entityId: string;
  entityName?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerNotificationListResponse {
  data: ManagerNotification[];
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountResponse {
  count: number;
}
