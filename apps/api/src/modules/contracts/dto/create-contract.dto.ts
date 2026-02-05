import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDateString
} from "class-validator";

export class CreateContractDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  noEndDate?: boolean = true;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean = false;

  @IsOptional()
  @IsNumber()
  maturity?: number = 0;

  @IsOptional()
  @IsString()
  lateFeeType?: string = "yi-ufe";

  @IsOptional()
  @IsString()
  incraseRateType?: string = "yi-ufe";

  @IsOptional()
  @IsString()
  incrasePeriod?: string = "3-month";

  @IsOptional()
  @IsBoolean()
  noVat?: boolean = false;

  @IsOptional()
  @IsBoolean()
  noNotification?: boolean = false;
}
