import { IsOptional, IsString, IsNumber, IsDateString } from "class-validator";

export class EDocCreditQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

export class CreateEDocCreditDto {
  @IsString()
  erpId: string;

  @IsString()
  customerId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  count: number;

  @IsString()
  currency: string;

  @IsString()
  internalFirm: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateEDocCreditDto {
  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  invoiceUUID?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber()
  grandTotal?: number;

  @IsOptional()
  @IsNumber()
  taxTotal?: number;

  @IsOptional()
  @IsString()
  invoiceNo?: string;
}

export class EDocCreditResponseDto {
  _id: string;
  id: string;
  erpId: string;
  customerId: string;
  customerName: string;
  price: number;
  count: number;
  total: number;
  currency: string;
  internalFirm: string;
  date: Date;
  invoiceNumber: string;
  invoiceUUID: string;
  invoiceDate: Date;
  grandTotal: number;
  taxTotal: number;
  invoiceNo: string;
  editDate: Date;
  editUser: string;
  creatorId: string;
}

export class EDocCreditsListResponseDto {
  data: EDocCreditResponseDto[];
  total: number;
}
