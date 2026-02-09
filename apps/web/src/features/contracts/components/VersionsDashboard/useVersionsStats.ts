import { useMemo } from "react";
import { useContractVersions } from "../../hooks/useContractDetail";
import type { ContractVersion } from "../../types";
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

export interface TypeDistributionItem {
  name: string;
  count: number;
}

export interface VersionsStats {
  total: number;
  active: number;
  passive: number;
  expired: number;
  totalByPrice: CurrencyBreakdown;
  typeDistribution: TypeDistributionItem[];
  today: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;
  monthlyTrend: MonthlyTrend[];
}

function getTypeLabel(value: string | undefined): string {
  const raw = (value || "").trim();
  return raw.length > 0 ? raw : "Bilinmeyen";
}

export function useVersionsStats(contractId?: string) {
  const shouldFetchAll = !contractId;
  const { data, isLoading } = useContractVersions(contractId, shouldFetchAll);

  const stats = useMemo<VersionsStats>(() => {
    const allItems = data?.data ?? [];
    const now = new Date();

    const items = allItems.filter((i) => i.enabled && !i.expired);

    const total = items.length;
    const active = items.length;
    const passive = allItems.length - active;
    const expired = allItems.filter((i) => i.expired).length;

    const typeMap = new Map<string, number>();
    for (const item of items) {
      const label = getTypeLabel(item.type);
      typeMap.set(label, (typeMap.get(label) || 0) + 1);
    }
    const typeDistribution = Array.from(typeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const totalByPrice: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };
    for (const item of items) {
      const cur = item.currency as keyof CurrencyBreakdown;
      if (cur in totalByPrice) {
        totalByPrice[cur] += item.price;
      }
    }

    const todayItems = items.filter((i) => i.editDate && isSameDay(new Date(i.editDate), now));
    const thisMonthItems = items.filter((i) => i.editDate && isSameMonth(new Date(i.editDate), now));
    const thisYearItems = items.filter((i) => i.editDate && isSameYear(new Date(i.editDate), now));

    const today = getTimePeriodStats(
      todayItems,
      (item) => item.currency,
      (item) => item.price
    );
    const thisMonth = getTimePeriodStats(
      thisMonthItems,
      (item) => item.currency,
      (item) => item.price
    );
    const thisYear = getTimePeriodStats(
      thisYearItems,
      (item) => item.currency,
      (item) => item.price
    );

    const monthlyTrend = getMonthlyTrend(items, (item) => item.editDate);

    return {
      total,
      active,
      passive,
      expired,
      totalByPrice,
      typeDistribution,
      today,
      thisMonth,
      thisYear,
      monthlyTrend,
    };
  }, [data]);

  return { stats, isLoading };
}
