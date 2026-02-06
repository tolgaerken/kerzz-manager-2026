import { IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ErpBalanceQueryDto {
  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortField?: string = "CariUnvan";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "asc";
}
