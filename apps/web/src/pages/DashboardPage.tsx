import { useState } from "react";
import { AlertCircle, LayoutDashboard, RefreshCw } from "lucide-react";
import { useAuth } from "../features/auth";
import {
  ConversionRates,
  FunnelChart,
  PipelineValueCard,
  usePipelineStats,
} from "../features/pipeline-dashboard";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";

export function DashboardPage() {
  const { userInfo, activeLicance, isAdmin, isFinance, isManager } = useAuth();
  const {
    data: pipelineData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = usePipelineStats();

  // Collapsible section state
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Dashboard",
    expanded: isHeaderExpanded,
    onExpandedChange: setIsHeaderExpanded,
    desktopActions: (
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        Yenile
      </button>
    ),
    mobileActions: (
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
      </button>
    ),
    children: (
      <p className="text-sm text-muted-foreground">
        Hoş geldiniz, {userInfo?.name}. İşte güncel durumunuz.
      </p>
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Header Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
        {/* Funnel Overview */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">Satış Pipeline Özeti</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Lead, teklif ve satış performansı</p>
          </div>
        </div>

        {isError && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 md:p-4 text-[var(--color-error)]">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm md:text-base">Pipeline verileri yüklenemedi</p>
              <p className="text-xs md:text-sm opacity-80 truncate">
                {error instanceof Error ? error.message : "Bilinmeyen hata"}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <FunnelChart
              leads={pipelineData.leads}
              offers={pipelineData.offers}
              sales={pipelineData.sales}
              isLoading={isLoading}
            />
          </div>
          <PipelineValueCard
            value={pipelineData.metrics.pipelineValue}
            weightedValue={pipelineData.metrics.weightedPipelineValue}
            isLoading={isLoading}
          />
        </div>

        <ConversionRates
          leadToOfferRate={pipelineData.metrics.leadToOfferRate}
          offerToSaleRate={pipelineData.metrics.offerToSaleRate}
          overallConversionRate={pipelineData.metrics.overallConversionRate}
          isLoading={isLoading}
        />

        {/* Info Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {/* Kullanıcı Bilgileri */}
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-foreground">Kullanıcı Bilgileri</h2>
            <dl className="space-y-2 md:space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Ad</dt>
                <dd className="text-foreground text-right truncate">{userInfo?.name ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">E-posta</dt>
                <dd className="text-foreground text-right truncate">{userInfo?.mail ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Telefon</dt>
                <dd className="text-foreground text-right">{userInfo?.phone ?? "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Lisans Bilgileri */}
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-foreground">Lisans Bilgileri</h2>
            <dl className="space-y-2 md:space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Marka</dt>
                <dd className="text-foreground text-right truncate">{activeLicance?.brand ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Lisans ID</dt>
                <dd className="text-foreground text-right">{activeLicance?.licanceId ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Roller</dt>
                <dd className="text-foreground text-right truncate">
                  {activeLicance?.roles.map((r) => r.name).join(", ") ?? "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Yetkiler */}
          <div className="rounded-lg border border-border bg-surface p-4 md:p-6 md:col-span-2">
            <h2 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-foreground">Yetkiler</h2>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <span className="rounded-full bg-success/20 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium text-success">
                  Yönetici
                </span>
              )}
              {isFinance && (
                <span className="rounded-full bg-info/20 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium text-info">
                  Finans
                </span>
              )}
              {isManager && (
                <span className="rounded-full bg-accent/20 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm font-medium text-accent">
                  Müdür
                </span>
              )}
              {!isAdmin && !isFinance && !isManager && (
                <span className="text-xs md:text-sm text-muted-foreground">Standart kullanıcı</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
