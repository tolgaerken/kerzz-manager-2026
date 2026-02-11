import { useMemo } from "react";
import { useContractSaasStats } from "../../hooks/useContractDetail";
import { useSoftwareProducts } from "../../../software-products/hooks/useSoftwareProducts";
import type {
  CurrencyBreakdown,
  MonthlyTrend,
  TimePeriodStats,
} from "../shared/dashboard/types";

export interface ProductDistributionItem {
  name: string;
  count: number;
}

export interface SaasStats {
  total: number;
  active: number;
  passive: number;
  blocked: number;
  expired: number;
  yearly: number;
  monthly: number;
  totalQty: number;
  yearlyByTotal: CurrencyBreakdown;
  monthlyByTotal: CurrencyBreakdown;
  productDistribution: ProductDistributionItem[];
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

export function useSaasStats(contractId?: string) {
  const { data, isLoading } = useContractSaasStats(contractId);
  const { data: productsData } = useSoftwareProducts({ limit: 10000, isSaas: true });

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of productsData?.data || []) {
      const label = product.nameWithCode || product.friendlyName || product.name || product.id;
      map.set(product.id, label);
    }
    return map;
  }, [productsData]);

  const stats = useMemo<SaasStats>(() => {
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
        totalQty: 0,
        yearlyByTotal: { tl: 0, usd: 0, eur: 0 },
        monthlyByTotal: { tl: 0, usd: 0, eur: 0 },
        productDistribution: [],
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

    // Backend'den gelen product ID'leri için isim mapping
    const productDistribution: ProductDistributionItem[] = data.productDistribution.map((p) => ({
      name: productMap.get(p.productId) || p.productId,
      count: p.count
    }));

    // Aylık trend için label ekle
    const monthlyTrend: MonthlyTrend[] = data.monthlyTrend.map((m) => ({
      month: m.month,
      label: getMonthLabel(m.month),
      count: m.count
    }));

    return {
      ...data,
      productDistribution,
      monthlyTrend
    };
  }, [data, productMap]);

  return { stats, isLoading };
}
