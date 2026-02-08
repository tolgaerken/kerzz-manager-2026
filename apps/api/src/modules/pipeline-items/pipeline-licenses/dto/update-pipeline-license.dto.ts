import { IsString, IsOptional, IsNumber, IsIn } from "class-validator";

export class UpdatePipelineLicenseDto {
  @IsString()
  @IsOptional()
  @IsIn(["offer", "sale"])
  parentType?: string;

  @IsString()
  @IsOptional()
  catalogId?: string;

  @IsString()
  @IsOptional()
  erpId?: string;

  @IsString()
  @IsOptional()
  pid?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  qty?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  vatRate?: number;

  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @IsNumber()
  @IsOptional()
  discountTotal?: number;

  @IsNumber()
  @IsOptional()
  taxTotal?: number;

  @IsNumber()
  @IsOptional()
  subTotal?: number;

  @IsNumber()
  @IsOptional()
  grandTotal?: number;
}
