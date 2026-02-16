import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateGroupCompanyDto {
  @IsString()
  @IsOptional()
  idc?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  cloudDb?: string;

  @IsString()
  @IsOptional()
  licanceId?: string;

  @IsBoolean()
  @IsOptional()
  eInvoice?: boolean;

  @IsString()
  @IsOptional()
  vatNo?: string;

  @IsBoolean()
  @IsOptional()
  noVat?: boolean;

  @IsString()
  @IsOptional()
  exemptionReason?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
