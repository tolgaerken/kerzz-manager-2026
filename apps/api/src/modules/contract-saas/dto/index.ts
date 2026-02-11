import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class ContractSaasQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ContractSaasResponseDto {
  _id: string;
  id: string;
  contractId: string;
  brand: string;
  licanceId: string;
  description: string;
  price: number;
  old_price: number;
  qty: number;
  currency: string;
  yearly: boolean;
  enabled: boolean;
  expired: boolean;
  blocked: boolean;
  productId: string;
  total: number;
  editDate: Date;
  editUser: string;
}

export class ContractSaasListResponseDto {
  data: ContractSaasResponseDto[];
  total: number;
}

export class CreateContractSaasDto {
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
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  yearly?: boolean;

  @IsOptional()
  @IsString()
  productId?: string;
}

export class UpdateContractSaasDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

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
  productId?: string;
}

// ─── Stats DTO'ları ──────────────────────────────────────────

export class CurrencyBreakdownDto {
  tl: number;
  usd: number;
  eur: number;
}

export class CurrencyCountBreakdownDto {
  tl: number;
  usd: number;
  eur: number;
}

export class TimePeriodStatsDto {
  count: number;
  currencyCounts: CurrencyCountBreakdownDto;
  currencyTotals: CurrencyBreakdownDto;
}

export class ProductDistributionDto {
  productId: string;
  count: number;
}

export class MonthlyTrendDto {
  month: string;
  count: number;
}

export class SaasStatsDto {
  // Genel
  total: number;
  active: number;
  passive: number;
  blocked: number;
  expired: number;

  // Periyot bazlı
  yearly: number;
  monthly: number;

  // Toplam miktar
  totalQty: number;

  // Currency bazlı total toplamları
  yearlyByTotal: CurrencyBreakdownDto;
  monthlyByTotal: CurrencyBreakdownDto;

  // Ürün dağılımı
  productDistribution: ProductDistributionDto[];

  // Zaman bazlı
  today: TimePeriodStatsDto;
  thisMonth: TimePeriodStatsDto;
  thisYear: TimePeriodStatsDto;

  // Aylık trend
  monthlyTrend: MonthlyTrendDto[];
}

export class SaasStatsQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;
}
