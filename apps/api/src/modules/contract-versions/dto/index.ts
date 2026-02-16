import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from "class-validator";

export class ContractVersionQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ContractVersionResponseDto {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  price: number;
  old_price: number;
  currency: string;
  type: string;
  enabled: boolean;
  expired: boolean;
  startDate: Date;
  activated: boolean;
  activatedAt: Date;
  editDate: Date;
  editUser: string;
}

export class ContractVersionsListResponseDto {
  data: ContractVersionResponseDto[];
  total: number;
}

export class CreateContractVersionDto {
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
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  expired?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}

export class UpdateContractVersionDto {
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
  enabled?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  activated?: boolean;
}
