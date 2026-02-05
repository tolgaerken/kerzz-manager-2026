import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class ContractSupportQueryDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ContractSupportResponseDto {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  price: number;
  old_price: number;
  currency: string;
  type: string;
  yearly: boolean;
  enabled: boolean;
  blocked: boolean;
  expired: boolean;
  lastOnlineDay: number;
  calulatedPrice: number;
  editDate: Date;
  editUser: string;
}

export class ContractSupportsListResponseDto {
  data: ContractSupportResponseDto[];
  total: number;
}

export class CreateContractSupportDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;
}

export class UpdateContractSupportDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  blocked?: boolean;
}
