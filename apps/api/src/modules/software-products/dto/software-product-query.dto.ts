import { IsOptional, IsString, IsNumber, IsBoolean, Min } from "class-validator";
import { Type, Transform } from "class-transformer";

export class SoftwareProductQueryDto {
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
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  saleActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isSaas?: boolean;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "name";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "asc";
}
