import { IsEnum, IsOptional, IsString } from "class-validator";
import type { CronName } from "./dry-run.dto";

export class CronManualRunDto {
  @IsOptional()
  @IsEnum(["lead", "offer"])
  targetType?: "lead" | "offer";

  @IsOptional()
  @IsString()
  contextId?: string;

  @IsOptional()
  @IsString()
  logId?: string;

  @IsOptional()
  @IsString()
  planId?: string;
}

export interface CronManualRunResponseDto {
  cronName: CronName;
  success: boolean;
  skipped: boolean;
  message: string;
  executedAt: string;
  durationMs: number;
  details?: Record<string, unknown>;
}
