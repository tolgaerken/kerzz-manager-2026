import { useState, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  Loader2,
  RefreshCw,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import {
  useSales,
  useSaleStats,
  SalesGrid,
  getMonthRange,
  type Sale,
} from "../features/sales";
import { useCustomerLookup } from "../features/lookup";

export function SalesDashboardPage() {
  const defaultRange = useMemo(() => getMonthRange(), []);

  // Query params - no pagination, fetch all data for virtual scroll
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const queryParams = useMemo(
    () => ({
      sortField,
      sortOrder,
      startDate,
      endDate,
    }),
    [sortField, sortOrder, startDate, endDate]
  );

  const {
    data: salesData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSales(queryParams);
  const { data: statsData } = useSaleStats();
  const { getCustomerName } = useCustomerLookup();

  const enrichedSales = useMemo(() => {
    if (!salesData?.data) return [];
    return salesData.data.map((sale) => ({
      ...sale,
      customerName: getCustomerName(sale.customerId) !== "-"
        ? getCustomerName(sale.customerId)
        : sale.customerName || "-",
    }));
  }, [salesData, getCustomerName]);

  // Selection state
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const salesStats = [
    { label: "Toplam Satış", value: statsData?.total ?? 0, icon: DollarSign },
    { label: "Bekleyen", value: statsData?.pending ?? 0, icon: ShoppingCart },
    { label: "Aktif", value: statsData?.active ?? 0, icon: Users },
    { label: "Tamamlanan", value: statsData?.completed ?? 0, icon: TrendingUp },
  ];

  // Handlers
  const handleRowDoubleClick = useCallback((sale: Sale) => {
    // TODO: Detay modal açılabilir
    console.log("Sale double clicked:", sale._id);
  }, []);

  const handleSelectionChanged = useCallback((sale: Sale | null) => {
    setSelectedSale(sale);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Page Header & Stats */}
      <div className="flex-shrink-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Satış</h1>
            <p className="mt-1 text-muted">
              Satış performansınızı ve siparişlerinizi takip edin.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-foreground outline-none"
              />
              <span className="text-xs text-muted">—</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-medium text-foreground outline-none"
              />
            </div>
            <button
              onClick={() => refetch({ cancelRefetch: true })}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              Yenile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {salesStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-surface-elevated p-3">
                  <stat.icon className="h-5 w-5 text-muted" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Veri yüklenirken hata oluştu</p>
            <p className="text-sm opacity-80">
              {error instanceof Error ? error.message : "Bilinmeyen hata"}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="ml-auto rounded-lg border border-error/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-error/20"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Grid Container - Flex grow to fill remaining space */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
        <SalesGrid
          data={enrichedSales}
          loading={isLoading}
          onRowDoubleClick={handleRowDoubleClick}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}
