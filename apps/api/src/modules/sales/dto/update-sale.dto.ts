import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsIn,
} from "class-validator";

export class UpdateSaleDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsDateString()
  @IsOptional()
  saleDate?: string;

  @IsDateString()
  @IsOptional()
  implementDate?: string;

  @IsString()
  @IsOptional()
  sellerId?: string;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsNumber()
  @IsOptional()
  usdRate?: number;

  @IsNumber()
  @IsOptional()
  eurRate?: number;

  @IsString()
  @IsOptional()
  @IsIn([
    "pending", "collection-waiting", "setup-waiting",
    "training-waiting", "active", "completed", "cancelled",
  ])
  status?: string;

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  internalFirm?: string;

  // Dual write
  @IsArray()
  @IsOptional()
  products?: any[];

  @IsArray()
  @IsOptional()
  licenses?: any[];

  @IsArray()
  @IsOptional()
  rentals?: any[];

  @IsArray()
  @IsOptional()
  payments?: any[];
}
