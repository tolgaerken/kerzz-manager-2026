import { IsOptional, IsString, IsNumber, IsEnum, Min } from "class-validator";
import { Type, Transform } from "class-transformer";
import {
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "../schemas/system-log.schema";

export class SystemLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsEnum(SystemLogCategory)
  category?: SystemLogCategory;

  @IsOptional()
  @IsEnum(SystemLogAction)
  action?: SystemLogAction;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(SystemLogStatus)
  status?: SystemLogStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  startDate?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  endDate?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
