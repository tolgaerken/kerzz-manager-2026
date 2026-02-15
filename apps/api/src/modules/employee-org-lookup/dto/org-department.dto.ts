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
 * Departman oluşturma DTO
 */
export class CreateOrgDepartmentDto {
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
 * Departman güncelleme DTO
 */
export class UpdateOrgDepartmentDto {
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
 * Departman sorgu DTO
 */
export class OrgDepartmentQueryDto {
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
 * Departman response DTO
 */
export class OrgDepartmentResponseDto {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  description: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
