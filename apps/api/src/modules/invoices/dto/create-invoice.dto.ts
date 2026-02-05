import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsDate, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateInvoiceRowDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  taxTotal?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsNumber()
  grandTotal?: number;

  @IsOptional()
  @IsNumber()
  stoppageAmount?: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsString()
  eCreditId?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsNumber()
  grandTotal?: number;

  @IsOptional()
  @Type(() => Date)
  invoiceDate?: Date;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceRowDto)
  invoiceRows?: CreateInvoiceRowDto[];

  @IsOptional()
  @IsString()
  invoiceType?: string;

  @IsOptional()
  @IsString()
  invoiceUUID?: string;

  @IsOptional()
  @IsNumber()
  taxTotal?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @Type(() => Date)
  paymentSuccessDate?: Date;
}
