import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

// ─── Query DTO ───────────────────────────────────────────────

export class EDocMemberQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @IsString()
  active?: string; // "true" | "false" | "" (query param olarak string gelir)

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

// ─── Create DTO ──────────────────────────────────────────────

export class CreateEDocMemberDto {
  @IsString()
  erpId: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsString()
  internalFirm: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  syncErp?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  syncInbound?: boolean;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsString()
  contractType: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  contract?: boolean;
}

// ─── Update DTO ──────────────────────────────────────────────

export class UpdateEDocMemberDto {
  @IsOptional()
  @IsString()
  erpId?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsString()
  internalFirm?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  syncErp?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  syncInbound?: boolean;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  contract?: boolean;
}

// ─── Response DTO ────────────────────────────────────────────

export class EDocMemberResponseDto {
  _id: string;
  id: string;
  erpId: string;
  licanceId: string;
  internalFirm: string;
  active: boolean;
  syncErp: boolean;
  syncInbound: boolean;
  desc: string;
  taxNumber: string;
  contractType: string;
  creditPrice: number;
  totalPurchasedCredits: number;
  creditBalance: number;
  contract: boolean;
  customerName: string;
  licenseName: string;
  // Hesaplanan bakiye alanları
  totalCharge: number;
  totalConsumption: number;
  monthlyAverage: number;
  editDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class EDocMembersListResponseDto {
  data: EDocMemberResponseDto[];
  total: number;
}

// ─── Balance DTO ─────────────────────────────────────────────

export class MemberBalanceDto {
  erpId: string;
  creditBalance: number;
  totalCharge: number;
  totalConsumption: number;
  monthlyAverage: number;
}
