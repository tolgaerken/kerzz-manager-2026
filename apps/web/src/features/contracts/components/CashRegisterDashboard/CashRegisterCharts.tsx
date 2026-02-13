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
import type { CashRegisterStats } from "./useCashRegisterStats";

// ─── Renk ─────────────────────────────────────────────────────

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-info)",
  "var(--color-error)",
];

// ─── Ortak Kart Wrapper ──────────────────────────────────────

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Özel Tooltip ────────────────────────────────────────────

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
        <p className="mb-1 text-xs font-medium text-[var(--color-foreground)]">
          {label}
        </p>
      )}
      {payload.map((entry, idx) => (
        <p key={idx} className="text-xs text-[var(--color-muted-foreground)]">
          {entry.name}: <span className="font-semibold text-[var(--color-foreground)]">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Pie Chart Bileşeni ──────────────────────────────────────

function MiniPieChart({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
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
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              formatter={(value: string) => (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────

interface CashRegisterChartsProps {
  stats: CashRegisterStats;
}

export function CashRegisterCharts({ stats }: CashRegisterChartsProps) {
  // Tür dağılımı (TSM vs GMP)
  const typeData = useMemo(
    () => [
      { name: "TSM", value: stats.tsm },
      { name: "GMP", value: stats.gmp },
    ],
    [stats.tsm, stats.gmp]
  );

  // Para birimi dağılımı (yıllık + aylık birleşik tutar)
  const currencyData = useMemo(() => {
    const tl = stats.yearlyByPrice.tl + stats.monthlyByPrice.tl;
    const usd = stats.yearlyByPrice.usd + stats.monthlyByPrice.usd;
    const eur = stats.yearlyByPrice.eur + stats.monthlyByPrice.eur;

    const items = [
      { name: "TL", value: tl },
      { name: "USD", value: usd },
      { name: "EUR", value: eur },
    ];

    return items.filter((i) => i.value > 0);
  }, [stats.yearlyByPrice, stats.monthlyByPrice]);

  // Model dağılımı (ilk 8)
  const modelData = useMemo(
    () => stats.modelDistribution.slice(0, 8),
    [stats.modelDistribution]
  );

  // Aylık trend
  const trendData = useMemo(() => stats.monthlyTrend, [stats.monthlyTrend]);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* Tür Dağılımı */}
      <MiniPieChart data={typeData} title="Tür Dağılımı" />

      {/* Para Birimi Dağılımı */}
      <MiniPieChart data={currencyData} title="Para Birimi Dağılımı (Tutar)" />

      {/* Model Bazlı Dağılım */}
      <ChartCard title="Model Bazlı Dağılım">
        {modelData.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">Veri yok</p>
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart
                data={modelData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Adet"
                  fill="var(--color-primary)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Aylık Trend */}
      <ChartCard title="Aylık Trend (Son 12 Ay)">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={trendData}
              margin={{ top: 0, right: 8, bottom: 0, left: -16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
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
                name="Yeni Kayıt"
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
