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
 * Lokasyon oluşturma DTO
 */
export class CreateOrgLocationDto {
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
  address?: string;

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
 * Lokasyon güncelleme DTO
 */
export class UpdateOrgLocationDto {
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
  address?: string;

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
 * Lokasyon sorgu DTO
 */
export class OrgLocationQueryDto {
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
 * Lokasyon response DTO
 */
export class OrgLocationResponseDto {
  _id: string;
  name: string;
  isActive: boolean;
  address: string;
  description: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
