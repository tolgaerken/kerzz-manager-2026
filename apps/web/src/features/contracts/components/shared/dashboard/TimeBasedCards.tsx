import { CalendarDays, CalendarRange, Calendar } from "lucide-react";
import { CURRENCY_LABELS, formatCurrency } from "./currency";
import type { TimePeriodStats } from "./types";

interface TimeCardProps {
  title: string;
  icon: typeof CalendarDays;
  colorVar: string;
  stats: TimePeriodStats;
}

function TimeCard({ title, icon: Icon, colorVar, stats }: TimeCardProps) {
  const currencies = (["tl", "usd", "eur"] as const).filter(
    (c) => stats.currencyCounts[c] > 0
  );

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-hover)]">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="rounded-lg p-2"
          style={{
            backgroundColor: `color-mix(in oklch, var(${colorVar}) 15%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: `var(${colorVar})` }} />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      </div>

      <p className="text-3xl font-bold text-[var(--color-foreground)]">
        {stats.count}
        <span className="ml-1.5 text-sm font-normal text-[var(--color-muted-foreground)]">
          adet
        </span>
      </p>

      {currencies.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-[var(--color-border)] pt-3">
          {currencies.map((cur) => (
            <div key={cur} className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted-foreground)]">
                {CURRENCY_LABELS[cur]}{" "}
                <span className="opacity-70">({stats.currencyCounts[cur]} adet)</span>
              </span>
              <span className="font-medium text-[var(--color-foreground)]">
                {formatCurrency(stats.currencyTotals[cur], cur)}
              </span>
            </div>
          ))}
        </div>
      )}

      {stats.count === 0 && (
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
          Bu donemde kayit yok
        </p>
      )}
    </div>
  );
}

interface TimeBasedCardsProps {
  today: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;
}

export function TimeBasedCards({ today, thisMonth, thisYear }: TimeBasedCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <TimeCard title="Bugun" icon={CalendarDays} colorVar="--color-success" stats={today} />
      <TimeCard title="Bu Ay" icon={CalendarRange} colorVar="--color-info" stats={thisMonth} />
      <TimeCard title="Bu Yil" icon={Calendar} colorVar="--color-primary" stats={thisYear} />
    </div>
  );
}
