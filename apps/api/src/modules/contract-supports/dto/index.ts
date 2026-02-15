import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from "class-validator";

export class ContractSupportQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;

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
  startDate: Date;
  activated: boolean;
  activatedAt: Date;
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

  @IsOptional()
  @IsDateString()
  startDate?: string;
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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  activated?: boolean;
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

export class TypeCountsDto {
  standart: number;
  gold: number;
  platin: number;
  vip: number;
}

export class MonthlyTrendDto {
  month: string;
  count: number;
}

export class SupportsStatsDto {
  // Genel
  total: number;
  active: number;
  passive: number;
  blocked: number;
  expired: number;

  // Periyot bazlı
  yearly: number;
  monthly: number;

  // Tip bazlı
  typeCounts: TypeCountsDto;

  // Currency bazlı fiyat toplamları
  yearlyByPrice: CurrencyBreakdownDto;
  monthlyByPrice: CurrencyBreakdownDto;

  // Zaman bazlı
  today: TimePeriodStatsDto;
  thisMonth: TimePeriodStatsDto;
  thisYear: TimePeriodStatsDto;

  // Aylık trend
  monthlyTrend: MonthlyTrendDto[];
}

export class SupportsStatsQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;
}
