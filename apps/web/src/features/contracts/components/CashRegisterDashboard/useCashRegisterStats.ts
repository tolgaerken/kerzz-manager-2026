import { useMemo } from "react";
import { useContractCashRegisterStats } from "../../hooks/useContractDetail";
import { useActiveEftPosModels } from "../../hooks/useEftPosModels";

// ─── Tip Tanımları ───────────────────────────────────────────

export interface CurrencyBreakdown {
  tl: number;
  usd: number;
  eur: number;
}

export interface CurrencyCountBreakdown {
  tl: number;
  usd: number;
  eur: number;
}

export interface TimePeriodStats {
  count: number;
  currencyCounts: CurrencyCountBreakdown;
  currencyTotals: CurrencyBreakdown;
}

export interface ModelStat {
  name: string;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  label: string;
  count: number;
}

export interface CashRegisterStats {
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
  yearlyByPrice: CurrencyBreakdown;
  monthlyByPrice: CurrencyBreakdown;

  // Zaman bazlı (bugün, bu ay, bu yıl)
  today: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;

  // Model bazlı dağılım
  modelDistribution: ModelStat[];

  // Aylık trend (son 12 ay)
  monthlyTrend: MonthlyTrend[];
}

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
}

// ─── Hook ────────────────────────────────────────────────────

export function useCashRegisterStats(contractId?: string) {
  const { data, isLoading } = useContractCashRegisterStats(contractId);
  const { data: eftPosModelsData } = useActiveEftPosModels();

  const modelMap = useMemo(() => {
    const map = new Map<string, string>();
    if (eftPosModelsData?.data) {
      for (const m of eftPosModelsData.data) {
        map.set(m.id, m.name);
      }
    }
    return map;
  }, [eftPosModelsData]);

  const stats = useMemo<CashRegisterStats>(() => {
    if (!data) {
      // Varsayılan boş stats
      return {
        total: 0,
        active: 0,
        passive: 0,
        tsm: 0,
        gmp: 0,
        yearly: 0,
        monthly: 0,
        yearlyByPrice: { tl: 0, usd: 0, eur: 0 },
        monthlyByPrice: { tl: 0, usd: 0, eur: 0 },
        today: {
          count: 0,
          currencyCounts: { tl: 0, usd: 0, eur: 0 },
          currencyTotals: { tl: 0, usd: 0, eur: 0 }
        },
        thisMonth: {
          count: 0,
          currencyCounts: { tl: 0, usd: 0, eur: 0 },
          currencyTotals: { tl: 0, usd: 0, eur: 0 }
        },
        thisYear: {
          count: 0,
          currencyCounts: { tl: 0, usd: 0, eur: 0 },
          currencyTotals: { tl: 0, usd: 0, eur: 0 }
        },
        modelDistribution: [],
        monthlyTrend: []
      };
    }

    // Backend'den gelen model ID'leri için isim mapping
    const modelDistribution: ModelStat[] = data.modelDistribution.map((m) => ({
      name: modelMap.get(m.modelId) || m.modelId,
      count: m.count
    }));

    // Aylık trend için label ekle
    const monthlyTrend: MonthlyTrend[] = data.monthlyTrend.map((m) => ({
      month: m.month,
      label: getMonthLabel(m.month),
      count: m.count
    }));

    return {
      ...data,
      modelDistribution,
      monthlyTrend
    };
  }, [data, modelMap]);

  return { stats, isLoading };
}
