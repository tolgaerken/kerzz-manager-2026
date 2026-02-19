import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { useNotificationLogs } from "../../hooks";
import { NotificationHistoryGrid } from "../NotificationHistoryGrid";
import type {
  NotificationLogQueryParams,
  NotificationChannel,
  NotificationLogStatus,
  NotificationLogContextType,
} from "../../types";

export function NotificationHistory() {
  const [shouldLoadGrid, setShouldLoadGrid] = useState(false);
  const [queryParams, setQueryParams] = useState<NotificationLogQueryParams>({
    limit: 10000,
  });

  const { data, isLoading, refetch, isFetching } = useNotificationLogs(queryParams, {
    enabled: shouldLoadGrid,
  });

  const handleFilterChange = useCallback(
    (
      key: keyof NotificationLogQueryParams,
      value: string | number | undefined
    ) => {
      setQueryParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleFetchGrid = useCallback(() => {
    if (!shouldLoadGrid) {
      setShouldLoadGrid(true);
      return;
    }
    void refetch();
  }, [refetch, shouldLoadGrid]);

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-muted)]">Toplam</p>
            <p className="text-2xl font-semibold text-[var(--color-foreground)]">
              {data.stats.total}
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-muted)]">Başarılı</p>
            <p className="text-2xl font-semibold text-green-600">
              {data.stats.sent}
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-muted)]">Başarısız</p>
            <p className="text-2xl font-semibold text-red-600">
              {data.stats.failed}
            </p>
          </div>
          <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-muted)]">Kanal Dağılımı</p>
            <p className="text-sm text-[var(--color-foreground)]">
              📧 {data.stats.byChannel?.email || 0} | 📱{" "}
              {data.stats.byChannel?.sms || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={queryParams.channel || ""}
          onChange={(e) =>
            handleFilterChange(
              "channel",
              (e.target.value as NotificationChannel) || undefined
            )
          }
          className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
        >
          <option value="">Tüm Kanallar</option>
          <option value="email">E-posta</option>
          <option value="sms">SMS</option>
        </select>

        <select
          value={queryParams.status || ""}
          onChange={(e) =>
            handleFilterChange(
              "status",
              (e.target.value as NotificationLogStatus) || undefined
            )
          }
          className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
        >
          <option value="">Tüm Durumlar</option>
          <option value="sent">Başarılı</option>
          <option value="failed">Başarısız</option>
        </select>

        <select
          value={queryParams.contextType || ""}
          onChange={(e) =>
            handleFilterChange(
              "contextType",
              (e.target.value as NotificationLogContextType) || undefined
            )
          }
          className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
        >
          <option value="">Tüm Türler</option>
          <option value="invoice">Fatura</option>
          <option value="contract">Kontrat</option>
        </select>

        <input
          type="date"
          value={queryParams.startDate || ""}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
        />

        <input
          type="date"
          value={queryParams.endDate || ""}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
          className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
        />

        <button
          type="button"
          onClick={handleFetchGrid}
          disabled={isLoading || isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          Getir
        </button>
      </div>

      {/* AG Grid */}
      <div className="flex-1 min-h-[400px]">
        {shouldLoadGrid ? (
          <NotificationHistoryGrid
            data={data?.data ?? []}
            loading={isLoading}
          />
        ) : (
          <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)]">
            <button
              type="button"
              onClick={handleFetchGrid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-md hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Geçmiş Verilerini Getir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
