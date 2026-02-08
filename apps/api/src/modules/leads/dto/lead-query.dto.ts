import { IsOptional, IsNumber, IsString, IsDateString, Min, IsIn } from "class-validator";
import { Type } from "class-transformer";

export class LeadQueryDto {
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
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(["new", "contacted", "qualified", "unqualified", "converted", "lost", "all"])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(["low", "medium", "high", "urgent", "all"])
  priority?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
