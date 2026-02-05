export interface LogMention {
  userId: string;
  userName: string;
}

export interface LogReference {
  type: string; // "contract" | "license" | ...
  id: string;
  label: string;
}

export interface LogReminder {
  date: string;
  completed: boolean;
}

export interface Log {
  _id: string;
  id: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  mentions: LogMention[];
  references: LogReference[];
  reminder: LogReminder | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogQueryParams {
  customerId?: string;
  contextType?: string;
  contextId?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  data: Log[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLogInput {
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  mentions?: LogMention[];
  references?: LogReference[];
  reminder?: {
    date: string;
    completed?: boolean;
  };
  authorId: string;
  authorName: string;
}

export type NotificationType = "mention" | "reminder";

export interface Notification {
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
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  userId?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface LogPanelContext {
  customerId: string;
  contextType: string;
  contextId: string;
  title?: string;
}
