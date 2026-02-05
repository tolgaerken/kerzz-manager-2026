import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class ContractItemQueryDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ContractItemResponseDto {
  _id: string;
  id: string;
  contractId: string;
  itemId: string;
  description: string;
  price: number;
  old_price: number;
  qty: number;
  qtyDynamic: boolean;
  currency: string;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  erpId: string;
  editDate: Date;
  editUser: string;
}

export class ContractItemsListResponseDto {
  data: ContractItemResponseDto[];
  total: number;
}

export class CreateContractItemDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  itemId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsBoolean()
  qtyDynamic?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;

  @IsOptional()
  @IsString()
  erpId?: string;
}

export class UpdateContractItemDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsBoolean()
  qtyDynamic?: boolean;

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
  @IsString()
  erpId?: string;
}
