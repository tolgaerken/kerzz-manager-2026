import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsIn,
  IsDateString,
} from "class-validator";

export class CreatePipelinePaymentDto {
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @IsIn(["offer", "sale"])
  parentType: string;

  @IsString()
  @IsOptional()
  pipelineRef?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsString()
  @IsOptional()
  invoiceNo?: string;
}
