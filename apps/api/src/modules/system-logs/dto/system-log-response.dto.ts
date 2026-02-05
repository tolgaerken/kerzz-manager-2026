import {
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "../schemas/system-log.schema";

export interface SystemLogResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedSystemLogsResponseDto {
  data: SystemLogResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: SystemLogStatsDto;
}

export interface SystemLogStatsDto {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
}
