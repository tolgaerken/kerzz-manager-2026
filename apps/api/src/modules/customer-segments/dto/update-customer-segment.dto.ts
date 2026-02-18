import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateCustomerSegmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  invoiceOverdueNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  newInvoiceNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  lastPaymentNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  balanceNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  annualContractExpiryNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  monthlyContractExpiryNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  canBlockCashRegister?: boolean;

  @IsOptional()
  @IsBoolean()
  canBlockLicense?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
