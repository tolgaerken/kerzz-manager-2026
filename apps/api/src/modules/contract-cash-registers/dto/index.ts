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

export class ModelStatDto {
  modelId: string;
  count: number;
}

export class MonthlyTrendDto {
  month: string;
  count: number;
}

export class CashRegisterStatsDto {
  // Genel
  total: number;
  active: number;
  passive: number;

  // Tür bazlı
  tsm: number;
  gmp: number;

  // Periyot bazlı
  yearly: number;
  monthly: number;

  // Currency bazlı fiyat toplamları (aylık / yıllık ayrımı)
  yearlyByPrice: CurrencyBreakdownDto;
  monthlyByPrice: CurrencyBreakdownDto;

  // Zaman bazlı (bugün, bu ay, bu yıl)
  today: TimePeriodStatsDto;
  thisMonth: TimePeriodStatsDto;
  thisYear: TimePeriodStatsDto;

  // Model bazlı dağılım
  modelDistribution: ModelStatDto[];

  // Aylık trend (son 12 ay)
  monthlyTrend: MonthlyTrendDto[];
}

export class CashRegisterStatsQueryDto {
  @IsOptional()
  @IsString()
  contractId?: string;
}
