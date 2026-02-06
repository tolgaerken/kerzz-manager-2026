import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import {
  NotificationLogStatus,
  NotificationLogChannel,
  NotificationLogContextType,
} from "../schemas/notification-log.schema";

export class NotificationLogQueryDto {
  @IsOptional()
  @IsEnum(["email", "sms"])
  channel?: NotificationLogChannel;

  @IsOptional()
  @IsEnum(["sent", "failed"])
  status?: NotificationLogStatus;

  @IsOptional()
  @IsEnum(["invoice", "contract"])
  contextType?: NotificationLogContextType;

  @IsOptional()
  @IsString()
  contextId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  templateCode?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 50;
}

export class NotificationLogResponseDto {
  _id: string;
  id: string;
  templateCode: string;
  channel: NotificationLogChannel;
  recipientEmail: string;
  recipientPhone: string;
  recipientName: string;
  contextType: NotificationLogContextType;
  contextId: string;
  customerId: string;
  invoiceId: string;
  contractId: string;
  status: NotificationLogStatus;
  errorMessage: string;
  messageId: string;
  responseData: Record<string, unknown>;
  templateData: Record<string, unknown>;
  renderedSubject: string;
  renderedBody: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedNotificationLogsResponseDto {
  data: NotificationLogResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    sent: number;
    failed: number;
    byChannel: Record<string, number>;
  };
}

export interface DispatchNotificationDto {
  templateCode: string;
  channel: NotificationLogChannel;
  recipient: {
    email?: string;
    phone?: string;
    name?: string;
  };
  contextType: NotificationLogContextType;
  contextId: string;
  customerId?: string;
  invoiceId?: string;
  contractId?: string;
  templateData: Record<string, unknown>;
}
