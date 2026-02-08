import { useMemo } from "react";
import { useContractCashRegisters } from "../../hooks/useContractDetail";
import { useActiveEftPosModels } from "../../hooks/useEftPosModels";
import type { ContractCashRegister } from "../../types";

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

function isSameDay(date: Date, ref: Date): boolean {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth() &&
    date.getDate() === ref.getDate()
  );
}

function isSameMonth(date: Date, ref: Date): boolean {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth()
  );
}

function isSameYear(date: Date, ref: Date): boolean {
  return date.getFullYear() === ref.getFullYear();
}

function getTimePeriodStats(items: ContractCashRegister[]): TimePeriodStats {
  const currencyCounts: CurrencyCountBreakdown = { tl: 0, usd: 0, eur: 0 };
  const currencyTotals: CurrencyBreakdown = { tl: 0, usd: 0, eur: 0 };

  for (const item of items) {
    const cur = item.currency as keyof CurrencyBreakdown;
    if (cur in currencyCounts) {
      currencyCounts[cur]++;
      currencyTotals[cur] += item.price;
    }
  }

  return { count: items.length, currencyCounts, currencyTotals };
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Hook ────────────────────────────────────────────────────

export function useCashRegisterStats() {
  const { data, isLoading } = useContractCashRegisters(undefined, true);
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
    const allItems = data?.data ?? [];
    const now = new Date();

    // Sadece aktif kayıtları baz al
    const items = allItems.filter((i) => i.enabled && !i.expired);

    // Genel sayılar
    const total = items.length;
    const active = items.length;
    const passive = allItems.length - active;

    // Tür bazlı
    const tsm = items.filter((i) => i.type === "tsm").length;
    const gmp = items.filter((i) => i.type === "gmp").length;

    // Periyot bazlı
    const yearly = items.filter((i) => i.yearly).length;
    const monthly = items.filter((i) => !i.yearly).length;

    // Currency bazlı fiyat toplamları (aylık / yıllık ayrımı)
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

    // Zaman bazlı
    const todayItems = items.filter((i) => i.editDate && isSameDay(new Date(i.editDate), now));
    const thisMonthItems = items.filter((i) => i.editDate && isSameMonth(new Date(i.editDate), now));
    const thisYearItems = items.filter((i) => i.editDate && isSameYear(new Date(i.editDate), now));

    const today = getTimePeriodStats(todayItems);
    const thisMonth = getTimePeriodStats(thisMonthItems);
    const thisYear = getTimePeriodStats(thisYearItems);

    // Model bazlı dağılım
    const modelCounts = new Map<string, number>();
    for (const item of items) {
      if (item.model) {
        modelCounts.set(item.model, (modelCounts.get(item.model) || 0) + 1);
      }
    }
    const modelDistribution: ModelStat[] = Array.from(modelCounts.entries())
      .map(([id, count]) => ({
        name: modelMap.get(id) || id,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Aylık trend (son 12 ay)
    const monthlyMap = new Map<string, number>();
    const months: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d);
      const label = getMonthLabel(d);
      monthlyMap.set(key, 0);
      months.push({ key, label });
    }

    for (const item of items) {
      if (item.editDate) {
        const d = new Date(item.editDate);
        const key = getMonthKey(d);
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, monthlyMap.get(key)! + 1);
        }
      }
    }

    const monthlyTrend: MonthlyTrend[] = months.map((m) => ({
      month: m.key,
      label: m.label,
      count: monthlyMap.get(m.key) || 0,
    }));

    return {
      total,
      active,
      passive,
      tsm,
      gmp,
      yearly,
      monthly,
      yearlyByPrice,
      monthlyByPrice,
      today,
      thisMonth,
      thisYear,
      modelDistribution,
      monthlyTrend,
    };
  }, [data, modelMap]);

  return { stats, isLoading };
}
