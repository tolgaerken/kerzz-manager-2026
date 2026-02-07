import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class ContractCashRegisterQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}

export class ContractCashRegisterResponseDto {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  legalId: string;
  model: string;
  type: string;
  price: number;
  old_price: number;
  currency: string;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  eftPosActive: boolean;
  folioClose: boolean;
  editDate: Date;
  editUser: string;
}

export class ContractCashRegistersListResponseDto {
  data: ContractCashRegisterResponseDto[];
  total: number;
}

export class CreateContractCashRegisterDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsString()
  legalId?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;
}

export class UpdateContractCashRegisterDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsString()
  legalId?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  eftPosActive?: boolean;

  @IsOptional()
  @IsBoolean()
  folioClose?: boolean;
}
