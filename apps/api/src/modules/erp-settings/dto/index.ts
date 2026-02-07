import { IsOptional, IsString } from "class-validator";

export class CreateErpSettingDto {
  @IsString()
  key: string;

  @IsString()
  erpId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  noVatErpId?: string;
}

export class UpdateErpSettingDto {
  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  noVatErpId?: string;
}

export interface ErpSettingResponseDto {
  _id: string;
  key: string;
  erpId: string;
  description: string;
  noVatErpId: string;
}
