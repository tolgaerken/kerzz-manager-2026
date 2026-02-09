import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SupportsStats } from "./useSupportsStats";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-info)",
  "var(--color-error)",
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      {children}
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-lg">
      {label && (
        <p className="mb-1 text-xs font-medium text-[var(--color-foreground)]">{label}</p>
      )}
      {payload.map((entry, idx) => (
        <p key={idx} className="text-xs text-[var(--color-muted-foreground)]">
          {entry.name}:{" "}
          <span className="font-semibold text-[var(--color-foreground)]">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function MiniPieChart({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <ChartCard title={title}>
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">Veri yok</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title}>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              formatter={(value: string) => (
                <span className="text-xs text-[var(--color-muted-foreground)]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface SupportsChartsProps {
  stats: SupportsStats;
}

export function SupportsCharts({ stats }: SupportsChartsProps) {
  const typeData = useMemo(
    () => [
      { name: "Standart", value: stats.typeCounts.standart },
      { name: "Gold", value: stats.typeCounts.gold },
      { name: "Platin", value: stats.typeCounts.platin },
      { name: "VIP", value: stats.typeCounts.vip },
    ],
    [stats.typeCounts]
  );

  const currencyData = useMemo(() => {
    const tl = stats.yearlyByPrice.tl + stats.monthlyByPrice.tl;
    const usd = stats.yearlyByPrice.usd + stats.monthlyByPrice.usd;
    const eur = stats.yearlyByPrice.eur + stats.monthlyByPrice.eur;

    return [
      { name: "TL", value: tl },
      { name: "USD", value: usd },
      { name: "EUR", value: eur },
    ].filter((i) => i.value > 0);
  }, [stats.yearlyByPrice, stats.monthlyByPrice]);

  const trendData = useMemo(() => stats.monthlyTrend, [stats.monthlyTrend]);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <MiniPieChart data={typeData} title="Tip Dagilimi" />
      <MiniPieChart data={currencyData} title="Para Birimi Dagilimi (Tutar)" />

      <ChartCard title="Aylik Trend (Son 12 Ay)">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={trendData} margin={{ top: 0, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Yeni Kayit"
                fill="var(--color-success)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
