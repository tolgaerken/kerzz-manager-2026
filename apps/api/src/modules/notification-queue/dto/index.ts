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

export type ContractQueueType = "yearly" | "monthly" | "all";
export type ContractMilestone = "pre-expiry" | "post-1" | "post-3" | "post-5" | "all";

export class ContractQueueQueryDto {
  @IsOptional()
  @IsEnum(["yearly", "monthly", "all"])
  contractType?: ContractQueueType = "all";

  @IsOptional()
  @IsEnum(["pre-expiry", "post-1", "post-3", "post-5", "all"])
  milestone?: ContractMilestone = "all";

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  daysFromExpiry?: number;

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

export interface QueueContactDto {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface QueueCustomerDto {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  contacts: QueueContactDto[];
}

export interface QueueNotifyUserDto {
  name: string;
  email: string;
  phone: string;
}

export interface QueueNotifyEntryDto {
  sms: boolean;
  email: boolean;
  sendTime: string | null;
  users: QueueNotifyUserDto[];
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
  notifyHistory: QueueNotifyEntryDto[];
  sentConditions: string[];
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
  sentConditions: string[];
  customer: QueueCustomerDto;
  yearly: boolean;
  milestone: ContractMilestone | null;
  renewalAmount?: number;
  oldAmount?: number;
  increaseRateInfo?: string;
  terminationDate?: string;
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
  yearlyContracts: number;
  monthlyContracts: number;
}

export interface ManualSendResultItemDto {
  type: "invoice" | "contract";
  id: string;
  channel: "email" | "sms";
  recipient?: string;
  success: boolean;
  error?: string;
}

export interface ManualSendResponseDto {
  sent: number;
  failed: number;
  results: ManualSendResultItemDto[];
}
