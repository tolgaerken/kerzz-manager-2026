import { useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  HardDrive,
  FileText,
  Cloud,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useSaleStats } from "../features/sales";
import { useCustomerLookup } from "../features/lookup";

const PERIODS = [
  { id: "daily", label: "Günlük" },
  { id: "weekly", label: "Haftalık" },
  { id: "monthly", label: "Aylık" },
  { id: "quarterly", label: "Çeyreklik" },
  { id: "yearly", label: "Yıllık" },
] as const;

const YEAR_RANGE = 15;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildDateRange(
  period: (typeof PERIODS)[number]["id"],
  year: number,
  monthIndex: number
) {
  const now = new Date();
  const reference = new Date(now);
  reference.setFullYear(year);
  reference.setMonth(monthIndex);
  reference.setDate(1);

  let start = new Date(reference);
  let end = new Date(reference);

  switch (period) {
    case "daily":
      // Günlük için bugünün tarihini kullan
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly": {
      const day = reference.getDay() || 7;
      start.setDate(reference.getDate() - (day - 1));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case "monthly":
      start = new Date(year, monthIndex, 1);
      end = new Date(year, monthIndex + 1, 0);
      break;
    case "quarterly": {
      const quarter = Math.floor(monthIndex / 3);
      start = new Date(year, quarter * 3, 1);
      end = new Date(year, quarter * 3 + 3, 0);
      break;
    }
    case "yearly":
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;
  }

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export function SalesDashboardPage() {
  const [period, setPeriod] = useState<
    "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: YEAR_RANGE }, (_, index) => currentYear - index);
  }, []);

  const monthOptions = useMemo(
    () => [
      { value: 0, label: "Ocak" },
      { value: 1, label: "Şubat" },
      { value: 2, label: "Mart" },
      { value: 3, label: "Nisan" },
      { value: 4, label: "Mayıs" },
      { value: 5, label: "Haziran" },
      { value: 6, label: "Temmuz" },
      { value: 7, label: "Ağustos" },
      { value: 8, label: "Eylül" },
      { value: 9, label: "Ekim" },
      { value: 10, label: "Kasım" },
      { value: 11, label: "Aralık" },
    ],
    []
  );

  const dateRange = useMemo(
    () => buildDateRange(period, selectedYear, selectedMonth),
    [period, selectedYear, selectedMonth]
  );

  const {
    data: statsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSaleStats({ period, ...dateRange });

  const { getCustomerName } = useCustomerLookup();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const salesStats = [
    {
      label: "Toplam Ciro",
      value: formatCurrency(statsData?.totalSalesAmount ?? 0),
      icon: DollarSign,
      color: "text-[var(--color-primary)]",
      bg: "bg-[var(--color-primary)]/10",
    },
    {
      label: "Donanım Satışları",
      value: formatCurrency(statsData?.hardwareSalesAmount ?? 0),
      icon: HardDrive,
      color: "text-[var(--color-info)]",
      bg: "bg-[var(--color-info)]/10",
    },
    {
      label: "Lisans Satışları",
      value: formatCurrency(statsData?.licenseSalesAmount ?? 0),
      icon: FileText,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
    {
      label: "SaaS Gelirleri",
      value: formatCurrency(statsData?.saasSalesAmount ?? 0),
      icon: Cloud,
      color: "text-[var(--color-warning)]",
      bg: "bg-[var(--color-warning)]/10",
    },
  ];

  const secondaryStats = [
    { label: "Toplam Satış Adedi", value: statsData?.total ?? 0, icon: ShoppingCart },
    { label: "Aktif Projeler", value: statsData?.active ?? 0, icon: TrendingUp },
    { label: "Tamamlanan", value: statsData?.completed ?? 0, icon: Users },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-1">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Satış Paneli</h1>
          <p className="mt-1 text-muted">
            Satış performansınızı ve ciro dağılımını takip edin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1">
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs font-medium text-muted-foreground">
                Yıl
              </span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="h-7 rounded-md border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-[var(--color-primary)]"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Ay
              </span>
              <select
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(Number(event.target.value))
                }
                className="h-7 rounded-md border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-[var(--color-primary)]"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p.id
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Veri yüklenirken hata oluştu</p>
            <p className="text-sm opacity-80">
              {error instanceof Error ? error.message : "Bilinmeyen hata"}
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {salesStats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface p-6 transition-all hover:border-[var(--color-primary)]/20 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">
              {isLoading ? "..." : stat.value}
            </p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top 10 Sales List */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-4">
            <h3 className="font-semibold text-foreground">En Büyük 10 Satış</h3>
            <p className="text-xs text-muted">Seçili dönemdeki en yüksek tutarlı satışlar</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full rounded-lg border border-border bg-surface-elevated p-6 text-center text-muted">
                Yükleniyor...
              </div>
            ) : statsData?.topSales?.length === 0 ? (
              <div className="col-span-full rounded-lg border border-border bg-surface-elevated p-6 text-center text-muted">
                Kayıt bulunamadı
              </div>
            ) : (
              statsData?.topSales?.map((sale) => {
                const statusValue = Array.isArray(sale.status)
                  ? sale.status[0] || "pending"
                  : sale.status || "pending";
                const statusStyle =
                  statusValue === "completed"
                    ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                    : statusValue === "active"
                      ? "bg-[var(--color-info)]/10 text-[var(--color-info)]"
                      : statusValue === "cancelled"
                        ? "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                        : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";

                const statusLabel =
                  statusValue === "completed"
                    ? "Tamamlandı"
                    : statusValue === "active"
                      ? "Aktif"
                      : statusValue === "cancelled"
                        ? "İptal"
                        : "Bekliyor";

                return (
                  <div
                    key={sale._id}
                    className="rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {getCustomerName(sale.customerId) !== "-"
                            ? getCustomerName(sale.customerId)
                            : sale.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">{sale.sellerName}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(sale.saleDate).toLocaleDateString("tr-TR")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(sale.grandTotal || 0)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="flex flex-col gap-4">
            {secondaryStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-4">
              <div className="rounded-lg bg-surface-elevated p-2">
                <stat.icon className="h-5 w-5 text-muted" />
              </div>
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {isLoading ? "-" : stat.value}
                </p>
              </div>
              </div>
            </div>
            ))}
            
            <div className="rounded-xl border border-border bg-surface p-4 flex-1">
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <TrendingUp className="h-8 w-8 text-muted mb-2" />
                    <p className="text-sm font-medium text-foreground">Satış Hedefleri</p>
                    <p className="text-xs text-muted mt-1">Bu özellik yakında eklenecek.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
