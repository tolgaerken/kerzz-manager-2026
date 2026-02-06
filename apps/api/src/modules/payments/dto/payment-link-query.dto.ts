import { IsOptional, IsString, IsNumber, IsDateString, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaymentLinkQueryDto {
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
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "createDate";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
