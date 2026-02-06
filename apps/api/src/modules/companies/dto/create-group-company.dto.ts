import { IsString, IsOptional, IsBoolean, IsNotEmpty } from "class-validator";

export class CreateGroupCompanyDto {
  @IsString()
  @IsNotEmpty({ message: "Firma kodu zorunludur" })
  id: string;

  @IsString()
  @IsNotEmpty({ message: "Firma kısa kodu zorunludur" })
  idc: string;

  @IsString()
  @IsNotEmpty({ message: "Firma adı zorunludur" })
  name: string;

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
}
