import { useMemo } from "react";
import { useContractSupportStats } from "../../hooks/useContractDetail";
import type {
  CurrencyBreakdown,
  MonthlyTrend,
  TimePeriodStats,
} from "../shared/dashboard/types";

export interface SupportsStats {
  total: number;
  active: number;
  passive: number;
  blocked: number;
  expired: number;
  yearly: number;
  monthly: number;
  typeCounts: {
    standart: number;
    gold: number;
    platin: number;
    vip: number;
  };
  yearlyByPrice: CurrencyBreakdown;
  monthlyByPrice: CurrencyBreakdown;
  today: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;
  monthlyTrend: MonthlyTrend[];
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
}

export function useSupportsStats(contractId?: string) {
  const { data, isLoading } = useContractSupportStats(contractId);

  const stats = useMemo<SupportsStats>(() => {
    if (!data) {
      // Varsayılan boş stats
      return {
        total: 0,
        active: 0,
        passive: 0,
        blocked: 0,
        expired: 0,
        yearly: 0,
        monthly: 0,
        typeCounts: { standart: 0, gold: 0, platin: 0, vip: 0 },
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
        monthlyTrend: []
      };
    }

    // Aylık trend için label ekle
    const monthlyTrend: MonthlyTrend[] = data.monthlyTrend.map((m) => ({
      month: m.month,
      label: getMonthLabel(m.month),
      count: m.count
    }));

    return {
      ...data,
      monthlyTrend
    };
  }, [data]);

  return { stats, isLoading };
}
