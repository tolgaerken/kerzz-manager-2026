import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsDateString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class PaymentListItemDto {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
}

export class ContractPaymentQueryDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}

export class ContractPaymentResponseDto {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  licanceId: string;
  invoiceNo: string;
  paid: boolean;
  payDate: Date;
  paymentDate: Date;
  invoiceDate: Date;
  total: number;
  invoiceTotal: number;
  balance: number;
  list: PaymentListItemDto[];
  yearly: boolean;
  eInvoice: boolean;
  uuid: string;
  ref: string;
  taxNo: string;
  internalFirm: string;
  contractNumber: number;
  segment: string;
  block: boolean;
  editDate: Date;
  editUser: string;
}

export class ContractPaymentsListResponseDto {
  data: ContractPaymentResponseDto[];
  total: number;
}

export class CreateContractPaymentDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsOptional()
  @IsDateString()
  payDate?: string;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentListItemDto)
  list?: PaymentListItemDto[];

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;
}

export class UpdateContractPaymentDto {
  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsDateString()
  payDate?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentListItemDto)
  list?: PaymentListItemDto[];

  @IsOptional()
  @IsBoolean()
  block?: boolean;
}
