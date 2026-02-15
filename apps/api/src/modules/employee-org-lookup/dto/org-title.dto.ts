import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Ünvan oluşturma DTO
 */
export class CreateOrgTitleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * Ünvan güncelleme DTO
 */
export class UpdateOrgTitleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * Ünvan sorgu DTO
 */
export class OrgTitleQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 100;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sortField?: string = "sortOrder";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}

/**
 * Ünvan response DTO
 */
export class OrgTitleResponseDto {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  description: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
