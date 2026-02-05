import { IsOptional, IsString, IsNumber, IsBoolean, Min } from "class-validator";
import { Type, Transform } from "class-transformer";

export class LicenseQueryDto {
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
  type?: string; // 'kerzz-pos' | 'orwi-pos' | 'kerzz-cloud'

  @IsOptional()
  @IsString()
  companyType?: string; // 'chain' | 'single' | 'belediye' | 'unv'

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  block?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  haveContract?: boolean;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "licenseId";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
