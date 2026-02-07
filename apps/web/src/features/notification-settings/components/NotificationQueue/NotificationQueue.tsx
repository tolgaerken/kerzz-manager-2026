import { useState, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Mail,
  MessageSquare,
  FileText,
  Building,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import {
  useInvoiceQueue,
  useContractQueue,
  useQueueStats,
  useSendManualNotification,
  useQueuePreview,
  useNotificationSettings,
} from "../../hooks";
import { InvoiceQueueGrid } from "../InvoiceQueueGrid";
import { ContractQueueGrid } from "../ContractQueueGrid";
import { OverdueDaysFilter } from "../OverdueDaysFilter";
import type {
  QueueInvoiceItem,
  QueueContractItem,
  InvoiceQueueQueryParams,
  ContractQueueQueryParams,
  ManualSendItem,
  QueuePreviewParams,
} from "../../types";

type QueueTab = "invoices" | "contracts";

export function NotificationQueue() {
  const [queueTab, setQueueTab] = useState<QueueTab>("invoices");
  const [invoiceParams, setInvoiceParams] = useState<InvoiceQueueQueryParams>({
    type: "all",
    limit: 10000,
  });
  const [contractParams, setContractParams] = useState<ContractQueueQueryParams>({
    limit: 10000,
  });
  const [selected, setSelected] = useState<ManualSendItem[]>([]);
  const [resultModal, setResultModal] = useState<{
    sent: number;
    failed: number;
    results: { type: string; id: string; channel: string; success: boolean; error?: string }[];
  } | null>(null);
  const [selectedOverdueDays, setSelectedOverdueDays] = useState<number[]>([]);
  const [previewParams, setPreviewParams] = useState<QueuePreviewParams | null>(null);

  const { data: settings } = useNotificationSettings();
  const { data: stats, isLoading: statsLoading } = useQueueStats();
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoiceQueue(invoiceParams);
  const { data: contractData, isLoading: contractsLoading } = useContractQueue(contractParams);
  const sendMutation = useSendManualNotification();
  const { data: previewData, isLoading: previewLoading } = useQueuePreview(previewParams);

  // Combobox'tan seçilen günlere göre faturaları filtrele
  const filteredInvoices = useMemo(() => {
    const data = invoiceData?.data ?? [];
    if (selectedOverdueDays.length === 0) return data;

    return data.filter((inv) => {
      return selectedOverdueDays.some((val) => {
        if (val >= 0) {
          // Pozitif/sıfır: vadesi bugün veya vadeden önce (due)
          return inv.overdueDays === 0 && val === 0;
        }
        // Negatif: vadesi geçmiş gün sayısı (overdue)
        return inv.overdueDays === Math.abs(val);
      });
    });
  }, [invoiceData?.data, selectedOverdueDays]);

  const handleInvoiceSelectionChanged = useCallback((items: QueueInvoiceItem[]) => {
    setSelected((prev) => {
      const nonInvoice = prev.filter((s) => s.type !== "invoice");
      return [...nonInvoice, ...items.map((i) => ({ type: "invoice" as const, id: i.id }))];
    });
  }, []);

  const handleContractSelectionChanged = useCallback((items: QueueContractItem[]) => {
    setSelected((prev) => {
      const nonContract = prev.filter((s) => s.type !== "contract");
      return [...nonContract, ...items.map((i) => ({ type: "contract" as const, id: i.id }))];
    });
  }, []);

  const handlePreviewEmail = useCallback(
    (id: string) => {
      setPreviewParams({ type: queueTab === "invoices" ? "invoice" : "contract", id, channel: "email" });
    },
    [queueTab]
  );

  const handlePreviewSms = useCallback(
    (id: string) => {
      setPreviewParams({ type: queueTab === "invoices" ? "invoice" : "contract", id, channel: "sms" });
    },
    [queueTab]
  );

  const handleSend = useCallback(
    (channels: ("email" | "sms")[]) => {
      if (selected.length === 0) return;
      sendMutation.mutate(
        { items: selected, channels },
        {
          onSuccess: (res) => {
            setResultModal({
              sent: res.sent,
              failed: res.failed,
              results: res.results,
            });
            setSelected([]);
          },
        }
      );
    },
    [selected, sendMutation]
  );

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
          <p className="text-sm text-[var(--color-muted)]">Bekleyen Faturalar</p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {statsLoading ? "—" : stats?.pendingInvoices ?? 0}
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
          <p className="text-sm text-[var(--color-muted)]">Vadesi Gelen</p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {statsLoading ? "—" : stats?.dueInvoices ?? 0}
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
          <p className="text-sm text-[var(--color-muted)]">Vadesi Geçmiş</p>
          <p className="text-2xl font-semibold text-red-600">
            {statsLoading ? "—" : stats?.overdueInvoices ?? 0}
          </p>
        </div>
        <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
          <p className="text-sm text-[var(--color-muted)]">Yaklaşan Kontratlar</p>
          <p className="text-2xl font-semibold text-[var(--color-foreground)]">
            {statsLoading ? "—" : stats?.pendingContracts ?? 0}
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-[var(--color-border)]">
        <button
          onClick={() => setQueueTab("invoices")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            queueTab === "invoices"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          Faturalar
        </button>
        <button
          onClick={() => setQueueTab("contracts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            queueTab === "contracts"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <Building className="w-4 h-4" />
          Kontratlar
        </button>
      </div>

      {/* Filters */}
      {queueTab === "invoices" && (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={invoiceParams.type ?? "all"}
            onChange={(e) =>
              setInvoiceParams((p) => ({
                ...p,
                type: e.target.value as InvoiceQueueQueryParams["type"],
              }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          >
            <option value="all">Tümü</option>
            <option value="due">Vadesi bugün</option>
            <option value="overdue">Vadesi geçmiş</option>
          </select>
          <OverdueDaysFilter
            dueDays={settings?.invoiceDueReminderDays ?? [0]}
            overdueDays={settings?.invoiceOverdueDays ?? [3, 5, 10]}
            selectedDays={selectedOverdueDays}
            onChange={setSelectedOverdueDays}
          />
          <input
            type="text"
            placeholder="Ara (fatura no, açıklama...)"
            value={invoiceParams.search ?? ""}
            onChange={(e) =>
              setInvoiceParams((p) => ({ ...p, search: e.target.value || undefined }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-64"
          />
        </div>
      )}
      {queueTab === "contracts" && (
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Ara (firma, marka...)"
            value={contractParams.search ?? ""}
            onChange={(e) =>
              setContractParams((p) => ({ ...p, search: e.target.value || undefined }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-64"
          />
        </div>
      )}

      {/* Action bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/30">
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {selected.length} kayıt seçildi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSend(["email"])}
              disabled={sendMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)]"
            >
              <Mail className="w-4 h-4" />
              E-posta Gönder
            </button>
            <button
              onClick={() => handleSend(["sms"])}
              disabled={sendMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)]"
            >
              <MessageSquare className="w-4 h-4" />
              SMS Gönder
            </button>
            <button
              onClick={() => handleSend(["email", "sms"])}
              disabled={sendMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90"
            >
              <Send className="w-4 h-4" />
              Tümünü Gönder
            </button>
          </div>
        </div>
      )}

      {/* AG Grid */}
      <div className="flex-1 min-h-[400px]">
        {queueTab === "invoices" && (
          <InvoiceQueueGrid
            data={filteredInvoices}
            loading={invoicesLoading}
            onSelectionChanged={handleInvoiceSelectionChanged}
            onPreviewEmail={handlePreviewEmail}
            onPreviewSms={handlePreviewSms}
          />
        )}
        {queueTab === "contracts" && (
          <ContractQueueGrid
            data={contractData?.data ?? []}
            loading={contractsLoading}
            onSelectionChanged={handleContractSelectionChanged}
            onPreviewEmail={handlePreviewEmail}
            onPreviewSms={handlePreviewSms}
          />
        )}
      </div>

      {/* Preview modal */}
      {previewParams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                  Bildirim Önizleme
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--color-surface-elevated)] text-[var(--color-muted)]">
                  {previewParams.channel === "email" ? "E-posta" : "SMS"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPreviewParams((p) => (p ? { ...p, channel: "email" } : null))
                  }
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    previewParams.channel === "email"
                      ? "bg-blue-600 text-white"
                      : "bg-[var(--color-surface-elevated)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  E-posta
                </button>
                <button
                  onClick={() =>
                    setPreviewParams((p) => (p ? { ...p, channel: "sms" } : null))
                  }
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    previewParams.channel === "sms"
                      ? "bg-green-600 text-white"
                      : "bg-[var(--color-surface-elevated)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setPreviewParams(null)}
                  className="p-1 ml-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {previewLoading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
                </div>
              ) : previewData ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm bg-[var(--color-surface-elevated)] rounded-lg p-3">
                    <div>
                      <span className="text-[var(--color-muted)]">Alıcı:</span>{" "}
                      <span className="text-[var(--color-foreground)] font-medium">
                        {previewData.recipient.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-muted)]">
                        {previewParams.channel === "email" ? "E-posta:" : "Telefon:"}
                      </span>{" "}
                      <span className="text-[var(--color-foreground)]">
                        {previewParams.channel === "email"
                          ? previewData.recipient.email
                          : previewData.recipient.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-muted)]">Şablon:</span>{" "}
                      <span className="font-mono text-xs text-[var(--color-foreground)]">
                        {previewData.templateCode}
                      </span>
                    </div>
                  </div>

                  {previewParams.channel === "email" && previewData.subject && (
                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                        Konu
                      </h4>
                      <div className="px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-[var(--color-foreground)]">
                        {previewData.subject}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                      İçerik
                    </h4>
                    {previewParams.channel === "email" ? (
                      <div
                        className="p-4 bg-white rounded-md border border-[var(--color-border)] max-h-[400px] overflow-auto"
                        dangerouslySetInnerHTML={{ __html: previewData.body }}
                      />
                    ) : (
                      <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-[var(--color-foreground)] whitespace-pre-wrap">
                        {previewData.body}
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
                    Bu önizleme gerçek müşteri ve fatura/kontrat verileriyle oluşturulmuştur.
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-[var(--color-muted)]">
                  Önizleme yüklenemedi.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setPreviewParams(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)]"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
              Gönderim Sonucu
            </h3>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{resultModal.sent} başarılı</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{resultModal.failed} başarısız</span>
              </div>
            </div>
            {resultModal.results.length > 0 && (
              <div className="max-h-48 overflow-y-auto text-sm space-y-1 mb-4">
                {resultModal.results.slice(0, 20).map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 ${
                      r.success ? "text-[var(--color-foreground)]" : "text-red-600"
                    }`}
                  >
                    {r.success ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>
                      {r.type} {r.id} – {r.channel}
                      {r.error && `: ${r.error}`}
                    </span>
                  </div>
                ))}
                {resultModal.results.length > 20 && (
                  <p className="text-[var(--color-muted)]">
                    ... ve {resultModal.results.length - 20} kayıt daha
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => setResultModal(null)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
