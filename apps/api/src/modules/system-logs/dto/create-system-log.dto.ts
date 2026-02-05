import { IsEnum, IsOptional, IsString, IsNumber, IsObject } from "class-validator";
import {
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "../schemas/system-log.schema";

export class CreateSystemLogDto {
  @IsEnum(SystemLogCategory)
  category: SystemLogCategory;

  @IsEnum(SystemLogAction)
  action: SystemLogAction;

  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsString()
  userName?: string | null;

  @IsOptional()
  @IsString()
  entityId?: string | null;

  @IsOptional()
  @IsString()
  entityType?: string | null;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ipAddress?: string | null;

  @IsOptional()
  @IsString()
  userAgent?: string | null;

  @IsOptional()
  @IsNumber()
  duration?: number | null;

  @IsOptional()
  @IsEnum(SystemLogStatus)
  status?: SystemLogStatus;

  @IsOptional()
  @IsString()
  errorMessage?: string | null;

  @IsOptional()
  @IsString()
  method?: string | null;

  @IsOptional()
  @IsString()
  path?: string | null;

  @IsOptional()
  @IsNumber()
  statusCode?: number | null;
}
