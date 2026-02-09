import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../features/auth";
import {
  ConversionRates,
  FunnelChart,
  PipelineValueCard,
  usePipelineStats,
} from "../features/pipeline-dashboard";

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted">
          Hoş geldiniz, {userInfo?.name}. İşte güncel durumunuz.
        </p>
      </div>

      {/* Funnel Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Satış Pipeline Özeti</h2>
          <p className="text-sm text-muted">Lead, teklif ve satış performansı</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-[var(--color-error)]">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Pipeline verileri yüklenemedi</p>
            <p className="text-sm opacity-80">
              {error instanceof Error ? error.message : "Bilinmeyen hata"}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kullanıcı Bilgileri */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Kullanıcı Bilgileri</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Ad</dt>
              <dd className="text-foreground">{userInfo?.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">E-posta</dt>
              <dd className="text-foreground">{userInfo?.mail ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Telefon</dt>
              <dd className="text-foreground">{userInfo?.phone ?? "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Lisans Bilgileri */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Lisans Bilgileri</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Marka</dt>
              <dd className="text-foreground">{activeLicance?.brand ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Lisans ID</dt>
              <dd className="text-foreground">{activeLicance?.licanceId ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Roller</dt>
              <dd className="text-foreground">
                {activeLicance?.roles.map((r) => r.name).join(", ") ?? "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Yetkiler */}
        <div className="rounded-lg border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Yetkiler</h2>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <span className="rounded-full bg-success/20 px-4 py-1.5 text-sm font-medium text-success">
                Yönetici
              </span>
            )}
            {isFinance && (
              <span className="rounded-full bg-info/20 px-4 py-1.5 text-sm font-medium text-info">
                Finans
              </span>
            )}
            {isManager && (
              <span className="rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
                Müdür
              </span>
            )}
            {!isAdmin && !isFinance && !isManager && (
              <span className="text-sm text-muted">Standart kullanıcı</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
