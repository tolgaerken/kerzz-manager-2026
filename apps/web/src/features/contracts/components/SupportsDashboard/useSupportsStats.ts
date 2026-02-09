import { useMemo } from "react";
import { useContractSupports } from "../../hooks/useContractDetail";
import type { ContractSupport } from "../../types";
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

function normalizeType(value: string | undefined): keyof SupportsStats["typeCounts"] | "other" {
  const normalized = (value || "standart").toLowerCase();
  if (normalized === "standard") return "standart";
  if (normalized === "platinum") return "platin";
  if (normalized === "standart" || normalized === "gold" || normalized === "platin" || normalized === "vip") {
    return normalized;
  }
  return "other";
}

export function useSupportsStats(contractId?: string) {
  const shouldFetchAll = !contractId;
  const { data, isLoading } = useContractSupports(contractId, shouldFetchAll);

  const stats = useMemo<SupportsStats>(() => {
    const allItems = data?.data ?? [];
    const now = new Date();

    const items = allItems.filter((i) => i.enabled && !i.expired);

    const total = items.length;
    const active = items.length;
    const passive = allItems.length - active;
    const blocked = allItems.filter((i) => i.blocked).length;
    const expired = allItems.filter((i) => i.expired).length;

    const typeCounts = { standart: 0, gold: 0, platin: 0, vip: 0 };
    for (const item of items) {
      const key = normalizeType(item.type);
      if (key in typeCounts) {
        typeCounts[key as keyof SupportsStats["typeCounts"]] += 1;
      }
    }

    const yearly = items.filter((i) => i.yearly).length;
    const monthly = items.filter((i) => !i.yearly).length;

    const yearlyByPrice: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };
    const monthlyByPrice: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };

    for (const item of items) {
      const cur = item.currency as keyof CurrencyBreakdown;
      if (cur in yearlyByPrice) {
        if (item.yearly) {
          yearlyByPrice[cur] += item.price;
        } else {
          monthlyByPrice[cur] += item.price;
        }
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
      blocked,
      expired,
      yearly,
      monthly,
      typeCounts,
      yearlyByPrice,
      monthlyByPrice,
      today,
      thisMonth,
      thisYear,
      monthlyTrend,
    };
  }, [data]);

  return { stats, isLoading };
}
