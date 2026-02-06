import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class AutoPaymentQueryDto {
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
  companyId?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "createDate";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
