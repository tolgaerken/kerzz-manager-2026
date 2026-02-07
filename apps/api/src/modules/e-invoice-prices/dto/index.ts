import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from "class-validator";

// ---------- Query ----------
export class EInvoicePriceQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  customerErpId?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

// ---------- Create ----------
export class CreateEInvoicePriceDto {
  @IsString()
  name: string;

  @IsString()
  erpId: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  isCredit?: boolean;

  @IsOptional()
  @IsString()
  customerErpId?: string;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

// ---------- Update ----------
export class UpdateEInvoicePriceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  isCredit?: boolean;

  @IsOptional()
  @IsString()
  customerErpId?: string;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

// ---------- Bulk Upsert ----------
export class BulkUpsertItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  erpId: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  isCredit?: boolean;

  @IsOptional()
  @IsString()
  customerErpId?: string;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}

// ---------- Response ----------
export class EInvoicePriceResponseDto {
  _id: string;
  id: string;
  sequence: number;
  name: string;
  erpId: string;
  unitPrice: number;
  discountRate: number;
  quantity: number;
  totalPrice: number;
  isCredit: boolean;
  customerErpId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EInvoicePricesListResponseDto {
  data: EInvoicePriceResponseDto[];
  total: number;
}
