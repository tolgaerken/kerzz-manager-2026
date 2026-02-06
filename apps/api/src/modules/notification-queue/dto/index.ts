import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

export class InvoiceQueueQueryDto {
  @IsOptional()
  @IsEnum(["due", "overdue", "all"])
  type?: "due" | "overdue" | "all" = "all";

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  overdueDaysMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  overdueDaysMax?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 50;
}

export class ContractQueueQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  remainingDaysMax?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 50;
}

export class ManualSendItemDto {
  @IsEnum(["invoice", "contract"])
  type: "invoice" | "contract";

  @IsString()
  id: string;
}

export class ManualSendDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualSendItemDto)
  @ArrayMinSize(1)
  items: ManualSendItemDto[];

  @IsArray()
  @IsEnum(["email", "sms"], { each: true })
  channels: ("email" | "sms")[];
}

export interface QueueCustomerDto {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

export interface QueueInvoiceItemDto {
  _id: string;
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  dueDate: string;
  overdueDays: number;
  status: "due" | "overdue";
  lastNotify: string | null;
  notifyCount: number;
  customer: QueueCustomerDto;
}

export interface QueueContractItemDto {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  endDate: string;
  remainingDays: number;
  customer: QueueCustomerDto;
}

export interface PaginatedQueueInvoicesResponseDto {
  data: QueueInvoiceItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedQueueContractsResponseDto {
  data: QueueContractItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueueStatsResponseDto {
  pendingInvoices: number;
  overdueInvoices: number;
  dueInvoices: number;
  pendingContracts: number;
}

export interface ManualSendResultItemDto {
  type: "invoice" | "contract";
  id: string;
  channel: "email" | "sms";
  success: boolean;
  error?: string;
}

export interface ManualSendResponseDto {
  sent: number;
  failed: number;
  results: ManualSendResultItemDto[];
}
