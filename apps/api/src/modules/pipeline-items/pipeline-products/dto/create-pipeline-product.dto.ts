import {
  IsString,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsIn,
} from "class-validator";

export class CreatePipelineProductDto {
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @IsIn(["offer", "sale"])
  parentType: string;

  @IsString()
  @IsOptional()
  pipelineRef?: string;

  @IsString()
  @IsOptional()
  catalogId?: string;

  @IsString()
  @IsOptional()
  erpId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

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

  @IsString()
  @IsOptional()
  saleCurrency?: string;

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
