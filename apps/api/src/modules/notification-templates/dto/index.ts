import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  IsEmail,
} from "class-validator";
import { Type } from "class-transformer";
import { NotificationChannel } from "../schemas/notification-template.schema";

export class CreateNotificationTemplateDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(["email", "sms"])
  channel: NotificationChannel;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  body: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateNotificationTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}

export class NotificationTemplateQueryDto {
  @IsOptional()
  @IsEnum(["email", "sms"])
  channel?: NotificationChannel;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

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

export class NotificationTemplateResponseDto {
  _id: string;
  id: string;
  name: string;
  code: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  isActive: boolean;
  variables: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedNotificationTemplatesResponseDto {
  data: NotificationTemplateResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class RenderTemplateDto {
  @IsString()
  code: string;

  @IsOptional()
  data?: Record<string, unknown>;
}

export class RenderTemplateResponseDto {
  subject?: string;
  body: string;
}

export class SendTestEmailDto {
  @IsEmail()
  recipientEmail: string;
}

export class SendTestEmailResponseDto {
  success: boolean;
  messageId?: string;
}
