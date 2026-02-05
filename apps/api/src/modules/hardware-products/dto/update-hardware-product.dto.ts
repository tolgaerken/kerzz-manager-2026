import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class UpdateHardwareProductDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  friendlyName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  purchaseCurrency?: string;

  @IsOptional()
  @IsString()
  saleCurrency?: string;

  @IsOptional()
  @IsBoolean()
  saleActive?: boolean;

  @IsOptional()
  @IsString()
  unit?: string;
}
