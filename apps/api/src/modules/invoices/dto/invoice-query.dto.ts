import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, Min } from "class-validator";
import { Type, Transform } from "class-transformer";

export class InvoiceQueryDto {
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
  invoiceType?: string; // 'contract' | 'sale' | 'eDocuments'

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "invoiceDate";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
