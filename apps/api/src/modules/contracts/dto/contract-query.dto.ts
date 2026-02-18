import { IsOptional, IsString, IsNumber, IsBoolean, Min } from "class-validator";
import { Transform, Type } from "class-transformer";

export class ContractQueryDto {
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
  flow?: "active" | "archive" | "future" | "free" | "all"; // contractFlow filter

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  yearly?: boolean; // true = yearly, false = monthly

  @IsOptional()
  @IsString()
  search?: string; // Search in brand, company

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @IsOptional()
  @IsString()
  customerId?: string;
}
