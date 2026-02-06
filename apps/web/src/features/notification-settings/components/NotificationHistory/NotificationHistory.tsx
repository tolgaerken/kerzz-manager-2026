import { useState, useCallback } from "react";
import {
  RefreshCw,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNotificationLogs } from "../../hooks";
import type {
  NotificationLogQueryParams,
  NotificationChannel,
  NotificationLogStatus,
  NotificationLogContextType,
} from "../../types";

export function NotificationHistory() {
  const [queryParams, setQueryParams] = useState<NotificationLogQueryParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, refetch } = useNotificationLogs(queryParams);

  const handleFilterChange = useCallback(
    (
      key: keyof NotificationLogQueryParams,
      value: string | number | undefined
    ) => {
      setQueryParams((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-4">
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
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[var(--color-surface-elevated)] rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Kanal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Alıcı
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Tür
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Şablon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((log) => (
                <tr
                  key={log._id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                >
                  <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                    {formatDate(log.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    {log.channel === "email" ? (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Mail className="w-4 h-4" />
                        E-posta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                    <div>
                      {log.recipientName && (
                        <p className="font-medium">{log.recipientName}</p>
                      )}
                      <p className="text-[var(--color-muted)]">
                        {log.recipientEmail || log.recipientPhone}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.contextType === "invoice" ? (
                      <span className="flex items-center gap-1 text-[var(--color-foreground)]">
                        <FileText className="w-4 h-4" />
                        Fatura
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--color-foreground)]">
                        <Building className="w-4 h-4" />
                        Kontrat
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                    {log.templateCode}
                  </td>
                  <td className="px-4 py-3">
                    {log.status === "sent" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Gönderildi
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1 text-red-600"
                        title={log.errorMessage}
                      >
                        <XCircle className="w-4 h-4" />
                        Başarısız
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[var(--color-muted)]"
                  >
                    Bildirim geçmişi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface-elevated)] rounded-lg">
          <div className="text-sm text-[var(--color-muted)]">
            Toplam {data.meta.total} kayıt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(data.meta.page - 1)}
              disabled={data.meta.page === 1}
              className="p-2 text-[var(--color-foreground)] disabled:text-[var(--color-muted)] disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-[var(--color-foreground)]">
              {data.meta.page} / {data.meta.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(data.meta.page + 1)}
              disabled={data.meta.page === data.meta.totalPages}
              className="p-2 text-[var(--color-foreground)] disabled:text-[var(--color-muted)] disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
