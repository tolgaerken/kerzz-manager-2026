import { useMemo } from "react";
import { useContractSaas } from "../../hooks/useContractDetail";
import { useSoftwareProducts } from "../../../software-products/hooks/useSoftwareProducts";
import type { ContractSaas } from "../../types";
import {
  getMonthlyTrend,
  getTimePeriodStats,
  isSameDay,
  isSameMonth,
  isSameYear,
} from "../shared/dashboard/time";
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

function getAmount(item: ContractSaas): number {
  if (item.total && item.total > 0) return item.total;
  if (item.qty && item.qty > 0) return item.price * item.qty;
  return item.price;
}

export function useSaasStats(contractId?: string) {
  const shouldFetchAll = !contractId;
  const { data, isLoading } = useContractSaas(contractId, shouldFetchAll);
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
    const allItems = data?.data ?? [];
    const now = new Date();

    const items = allItems.filter((i) => i.enabled && !i.expired);

    const total = items.length;
    const active = items.length;
    const passive = allItems.length - active;
    const blocked = allItems.filter((i) => i.blocked).length;
    const expired = allItems.filter((i) => i.expired).length;

    const yearly = items.filter((i) => i.yearly).length;
    const monthly = items.filter((i) => !i.yearly).length;
    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

    const yearlyByTotal: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };
    const monthlyByTotal: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };

    for (const item of items) {
      const cur = item.currency as keyof CurrencyBreakdown;
      if (cur in yearlyByTotal) {
        if (item.yearly) {
          yearlyByTotal[cur] += getAmount(item);
        } else {
          monthlyByTotal[cur] += getAmount(item);
        }
      }
    }

    const todayItems = items.filter((i) => i.editDate && isSameDay(new Date(i.editDate), now));
    const thisMonthItems = items.filter((i) => i.editDate && isSameMonth(new Date(i.editDate), now));
    const thisYearItems = items.filter((i) => i.editDate && isSameYear(new Date(i.editDate), now));

    const today = getTimePeriodStats(
      todayItems,
      (item) => item.currency,
      (item) => getAmount(item)
    );
    const thisMonth = getTimePeriodStats(
      thisMonthItems,
      (item) => item.currency,
      (item) => getAmount(item)
    );
    const thisYear = getTimePeriodStats(
      thisYearItems,
      (item) => item.currency,
      (item) => getAmount(item)
    );

    const productCounts = new Map<string, number>();
    for (const item of items) {
      const key = item.productId || "Bilinmeyen";
      productCounts.set(key, (productCounts.get(key) || 0) + 1);
    }
    const productDistribution = Array.from(productCounts.entries())
      .map(([id, count]) => ({
        name: productMap.get(id) || id,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const monthlyTrend = getMonthlyTrend(items, (item) => item.editDate);

    return {
      total,
      active,
      passive,
      blocked,
      expired,
      yearly,
      monthly,
      totalQty,
      yearlyByTotal,
      monthlyByTotal,
      productDistribution,
      today,
      thisMonth,
      thisYear,
      monthlyTrend,
    };
  }, [data, productMap]);

  return { stats, isLoading };
}
