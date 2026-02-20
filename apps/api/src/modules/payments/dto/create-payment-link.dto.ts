import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEmail,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreatePaymentLinkDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  gsm?: string;

  @IsString()
  name: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  installment?: number = 1;

  @IsOptional()
  @IsString()
  cardType?: string = "";

  @IsOptional()
  @IsBoolean()
  canRecurring?: boolean = false;

  @IsOptional()
  @IsBoolean()
  non3d?: boolean = false;

  @IsOptional()
  @IsString()
  staffName?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  invoiceNo?: string;

  /**
   * Ödeme linki bağlam tipi (invoice veya contract)
   */
  @IsOptional()
  @IsString()
  contextType?: "invoice" | "contract";

  /**
   * İlgili kaydın ID'si (invoice.id veya contract.id)
   */
  @IsOptional()
  @IsString()
  contextId?: string;

  /**
   * Kontrat numarası (contract.contractId)
   */
  @IsOptional()
  @IsString()
  contractNo?: string;

  /**
   * Bildirim kaynağı (cron veya manual)
   */
  @IsOptional()
  @IsString()
  notificationSource?: "cron" | "manual";
}
