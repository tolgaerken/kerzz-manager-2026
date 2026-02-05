/** Sistem log kategorileri */
export type SystemLogCategory = "AUTH" | "CRUD" | "CRON" | "SYSTEM";

/** Sistem log aksiyonları */
export type SystemLogAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "TOKEN_REFRESH"
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "CRON_START"
  | "CRON_END"
  | "CRON_FAILED"
  | "ERROR"
  | "WARNING"
  | "INFO";

/** Log durumu */
export type SystemLogStatus = "SUCCESS" | "FAILURE" | "ERROR";

/** Sistem log response */
export interface SystemLog {
  _id: string;
  category: SystemLogCategory;
  action: SystemLogAction;
  module: string;
  userId: string | null;
  userName: string | null;
  entityId: string | null;
  entityType: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  duration: number | null;
  status: SystemLogStatus;
  errorMessage: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  createdAt: string;
  updatedAt: string;
}

/** İstatistikler */
export interface SystemLogStats {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
}

/** Paginated response */
export interface SystemLogsResponse {
  data: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: SystemLogStats;
}

/** Query parametreleri */
export interface SystemLogQueryParams {
  page?: number;
  limit?: number;
  category?: SystemLogCategory | "";
  action?: SystemLogAction | "";
  module?: string;
  userId?: string;
  status?: SystemLogStatus | "";
  search?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}
