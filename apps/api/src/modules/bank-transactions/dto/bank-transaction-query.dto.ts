import { IsOptional, IsString, IsDateString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class BankTransactionQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  bankAccId?: string;

  @IsOptional()
  @IsString()
  erpStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
