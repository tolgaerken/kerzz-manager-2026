import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import type {
  FeedbackPriority,
  FeedbackStatus,
} from "../schemas/feedback.schema";

// ============ Query DTO ============
export class FeedbackQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(["open", "in_progress", "completed", "rejected", "all"])
  status?: FeedbackStatus | "all";

  @IsOptional()
  @IsEnum(["low", "medium", "high", "urgent", "all"])
  priority?: FeedbackPriority | "all";

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder?: "asc" | "desc";

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

// ============ Create DTO ============
export class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  screenshots?: string[];

  @IsOptional()
  @IsEnum(["low", "medium", "high", "urgent"])
  priority?: FeedbackPriority;
}

// ============ Update DTO ============
export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  screenshots?: string[];

  @IsOptional()
  @IsEnum(["low", "medium", "high", "urgent"])
  priority?: FeedbackPriority;

  @IsOptional()
  @IsEnum(["open", "in_progress", "completed", "rejected"])
  status?: FeedbackStatus;
}

// ============ Response DTOs ============
export class FeedbackResponseDto {
  _id: string;
  id: string;
  title: string;
  description: string;
  screenshots: string[];
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdBy: string;
  createdByName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class FeedbackListResponseDto {
  data: FeedbackResponseDto[];
  meta: PaginationMeta;
}
