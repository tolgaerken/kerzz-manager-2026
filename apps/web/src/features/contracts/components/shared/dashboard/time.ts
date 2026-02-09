import type {
  Currency,
  CurrencyBreakdown,
  CurrencyCountBreakdown,
  MonthlyTrend,
  TimePeriodStats,
} from "./types";

function createCurrencyBreakdown(): CurrencyBreakdown {
  return { tl: 0, usd: 0, eur: 0 };
}

function createCurrencyCountBreakdown(): CurrencyCountBreakdown {
  return { tl: 0, usd: 0, eur: 0 };
}

export function isSameDay(date: Date, ref: Date): boolean {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth() &&
    date.getDate() === ref.getDate()
  );
}

export function isSameMonth(date: Date, ref: Date): boolean {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth();
}

export function isSameYear(date: Date, ref: Date): boolean {
  return date.getFullYear() === ref.getFullYear();
}

export function getTimePeriodStats<T>(
  items: T[],
  getCurrency: (item: T) => Currency,
  getAmount: (item: T) => number
): TimePeriodStats {
  const currencyCounts = createCurrencyCountBreakdown();
  const currencyTotals = createCurrencyBreakdown();

  for (const item of items) {
    const cur = getCurrency(item);
    if (cur in currencyCounts) {
      currencyCounts[cur] += 1;
      currencyTotals[cur] += getAmount(item);
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

export function getMonthlyTrend<T>(
  items: T[],
  getDate: (item: T) => string | Date | undefined | null
): MonthlyTrend[] {
  const now = new Date();
  const monthlyMap = new Map<string, number>();
  const months: { key: string; label: string }[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getMonthKey(d);
    monthlyMap.set(key, 0);
    months.push({ key, label: getMonthLabel(d) });
  }

  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const d = raw instanceof Date ? raw : new Date(raw);
    const key = getMonthKey(d);
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
  }

  return months.map((m) => ({
    month: m.key,
    label: m.label,
    count: monthlyMap.get(m.key) || 0,
  }));
}
