import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { LeadLossInfoDto } from "./create-lead.dto";

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  assignedUserName?: string;

  @IsString()
  @IsOptional()
  @IsIn(["new", "contacted", "qualified", "unqualified", "converted", "lost"])
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(["low", "medium", "high", "urgent"])
  priority?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LeadLossInfoDto)
  lossInfo?: LeadLossInfoDto;
}
