import { useState, useCallback, useMemo, useRef } from "react";
import {
  RefreshCw,
  FileText,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Loader2,
  Send,
  Pause,
  Play,
  Square,
} from "lucide-react";
import {
  useInvoiceQueue,
  useContractQueue,
  useQueuePreview,
  useNotificationSettings,
  useBatchSendNotification,
  type BatchSendItem,
} from "../../hooks";
import { InvoiceQueueGrid } from "../InvoiceQueueGrid";
import { ContractQueueGrid } from "../ContractQueueGrid";
import { YearlyContractQueueGrid } from "../YearlyContractQueueGrid";
import { OverdueDaysFilter } from "../OverdueDaysFilter";
import {
  DuplicateSendWarningModal,
  type DuplicateItem,
} from "./DuplicateSendWarningModal";
import {
  getCurrentInvoiceCondition,
  getCurrentContractCondition,
  hasMatchingCondition,
} from "../../utils";
import type {
  QueueInvoiceItem,
  QueueContractItem,
  InvoiceQueueQueryParams,
  ContractQueueQueryParams,
  ContractMilestone,
  ManualSendItem,
  QueuePreviewParams,
} from "../../types";

type QueueTab = "invoices" | "yearly-contracts" | "monthly-contracts";

export function NotificationQueue() {
  const [queueTab, setQueueTab] = useState<QueueTab>("invoices");
  const [invoiceParams, setInvoiceParams] = useState<InvoiceQueueQueryParams>({
    type: "all",
    limit: 10000,
  });
  const [yearlyContractParams, setYearlyContractParams] = useState<ContractQueueQueryParams>({
    contractType: "yearly",
    milestone: "all",
    limit: 10000,
  });
  const [monthlyContractParams, setMonthlyContractParams] = useState<ContractQueueQueryParams>({
    contractType: "monthly",
    limit: 10000,
  });
  const [selected, setSelected] = useState<ManualSendItem[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<QueueInvoiceItem[]>([]);
  const [selectedContracts, setSelectedContracts] = useState<QueueContractItem[]>([]);
  const [selectedOverdueDays, setSelectedOverdueDays] = useState<number[]>([]);
  const [previewParams, setPreviewParams] = useState<QueuePreviewParams | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    duplicates: DuplicateItem[];
    channels: ("email" | "sms")[];
  } | null>(null);
  const pendingSendRef = useRef<{ channels: ("email" | "sms")[] } | null>(null);

  const { data: settings } = useNotificationSettings();
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoiceQueue(invoiceParams);
  const { data: yearlyContractData, isLoading: yearlyContractsLoading } = useContractQueue(yearlyContractParams);
  const { data: monthlyContractData, isLoading: monthlyContractsLoading } = useContractQueue(monthlyContractParams);
  const { data: previewData, isLoading: previewLoading } = useQueuePreview(previewParams);
  
  const {
    progress: batchProgress,
    startBatchSend,
    pauseBatchSend,
    resumeBatchSend,
    cancelBatchSend,
    clearBatchSend,
  } = useBatchSendNotification();

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
    setSelectedInvoices(items);
    setSelected((prev) => {
      const nonInvoice = prev.filter((s) => s.type !== "invoice");
      return [...nonInvoice, ...items.map((i) => ({ type: "invoice" as const, id: i.id }))];
    });
  }, []);

  const handleContractSelectionChanged = useCallback((items: QueueContractItem[]) => {
    setSelectedContracts(items);
    setSelected((prev) => {
      const nonContract = prev.filter((s) => s.type !== "contract");
      return [...nonContract, ...items.map((i) => ({ type: "contract" as const, id: i.id }))];
    });
  }, []);

  const handlePreviewEmail = useCallback(
    (id: string) => {
      const type = queueTab === "invoices" ? "invoice" : "contract";
      setPreviewParams({ type, id, channel: "email" });
    },
    [queueTab]
  );

  const handlePreviewSms = useCallback(
    (id: string) => {
      const type = queueTab === "invoices" ? "invoice" : "contract";
      setPreviewParams({ type, id, channel: "sms" });
    },
    [queueTab]
  );

  const executeSend = useCallback(
    (channels: ("email" | "sms")[]) => {
      if (selected.length === 0) return;

      const batchItems: BatchSendItem[] = [];

      for (const inv of selectedInvoices) {
        batchItems.push({
          type: "invoice",
          id: inv.id,
          label: inv.invoiceNumber || inv.id,
        });
      }

      for (const cont of selectedContracts) {
        batchItems.push({
          type: "contract",
          id: cont.id,
          label: cont.contractId || cont.company || cont.brand || cont.id,
        });
      }

      startBatchSend(batchItems, channels);
      setSelected([]);
      setSelectedInvoices([]);
      setSelectedContracts([]);
    },
    [selected, selectedInvoices, selectedContracts, startBatchSend]
  );

  const handleSend = useCallback(
    (channels: ("email" | "sms")[]) => {
      if (selected.length === 0) return;

      const duplicates: DuplicateItem[] = [];

      for (const inv of selectedInvoices) {
        const currentCondition = getCurrentInvoiceCondition(inv.overdueDays);
        if (hasMatchingCondition(inv.sentConditions, currentCondition)) {
          duplicates.push({
            type: "invoice",
            id: inv.id,
            label: inv.invoiceNumber,
            currentCondition,
          });
        }
      }

      for (const cont of selectedContracts) {
        const currentCondition = getCurrentContractCondition();
        if (hasMatchingCondition(cont.sentConditions, currentCondition)) {
          duplicates.push({
            type: "contract",
            id: cont.id,
            label: cont.contractId || cont.company || cont.brand,
            currentCondition,
          });
        }
      }

      if (duplicates.length > 0) {
        pendingSendRef.current = { channels };
        setDuplicateWarning({ duplicates, channels });
        return;
      }

      executeSend(channels);
    },
    [selected, selectedInvoices, selectedContracts, executeSend]
  );

  const handleDuplicateConfirm = useCallback(() => {
    const pending = pendingSendRef.current;
    setDuplicateWarning(null);
    pendingSendRef.current = null;
    if (pending) {
      executeSend(pending.channels);
    }
  }, [executeSend]);

  const handleDuplicateCancel = useCallback(() => {
    setDuplicateWarning(null);
    pendingSendRef.current = null;
  }, []);

  return (
    <div className="space-y-4 flex flex-col h-full">
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
          onClick={() => setQueueTab("yearly-contracts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            queueTab === "yearly-contracts"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Yıllık Kontratlar
          {yearlyContractData?.data?.length ? (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-warning)]/20 text-[var(--color-warning)]">
              {yearlyContractData.data.length}
            </span>
          ) : null}
        </button>
        <button
          onClick={() => setQueueTab("monthly-contracts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            queueTab === "monthly-contracts"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Aylık Kontratlar
          {monthlyContractData?.data?.length ? (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-info)]/20 text-[var(--color-info)]">
              {monthlyContractData.data.length}
            </span>
          ) : null}
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
      {queueTab === "yearly-contracts" && (
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={yearlyContractParams.milestone ?? "all"}
            onChange={(e) => {
              const value = e.target.value;
              if (value.startsWith("days-")) {
                const days = parseInt(value.replace("days-", ""), 10);
                setYearlyContractParams((p) => ({
                  ...p,
                  milestone: "pre-expiry",
                  daysFromExpiry: days,
                }));
              } else {
                setYearlyContractParams((p) => ({
                  ...p,
                  milestone: value as ContractMilestone,
                  daysFromExpiry: undefined,
                }));
              }
            }}
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          >
            <option value="all">Tüm Durumlar</option>
            <optgroup label="Bitiş Öncesi">
              <option value="pre-expiry">Tüm Bitiş Öncesi</option>
              <option value="days-30">30 günden az kalan</option>
              <option value="days-15">15 günden az kalan</option>
              <option value="days-7">7 günden az kalan</option>
            </optgroup>
            <optgroup label="Bitiş Sonrası">
              <option value="post-1">+1 Gün (Hatırlatma)</option>
              <option value="post-3">+3 Gün (Hatırlatma)</option>
              <option value="post-5">+5 Gün (Son Uyarı)</option>
            </optgroup>
          </select>
          <input
            type="text"
            placeholder="Ara (firma, marka...)"
            value={yearlyContractParams.search ?? ""}
            onChange={(e) =>
              setYearlyContractParams((p) => ({ ...p, search: e.target.value || undefined }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-64"
          />
        </div>
      )}
      {queueTab === "monthly-contracts" && (
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Ara (firma, marka...)"
            value={monthlyContractParams.search ?? ""}
            onChange={(e) =>
              setMonthlyContractParams((p) => ({ ...p, search: e.target.value || undefined }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-64"
          />
        </div>
      )}

      {/* Batch Sending Progress */}
      {batchProgress.status !== "idle" && (
        <div className="px-4 py-3 bg-[var(--color-info)]/10 rounded-lg border border-[var(--color-info)]/30">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {batchProgress.status === "running" ? (
                <Send className="w-5 h-5 text-[var(--color-info)]" />
              ) : batchProgress.status === "paused" ? (
                <Pause className="w-5 h-5 text-[var(--color-warning)]" />
              ) : batchProgress.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
              ) : (
                <XCircle className="w-5 h-5 text-[var(--color-error)]" />
              )}
              <span className="text-sm font-medium text-[var(--color-foreground)]">
                {batchProgress.status === "running" && "Bildirim Gönderiliyor"}
                {batchProgress.status === "paused" && "Duraklatıldı"}
                {batchProgress.status === "completed" && "Gönderim Tamamlandı"}
                {batchProgress.status === "cancelled" && "Gönderim İptal Edildi"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {batchProgress.status === "running" && (
                <button
                  onClick={pauseBatchSend}
                  className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Duraklat"
                >
                  <Pause className="w-4 h-4" />
                </button>
              )}
              {batchProgress.status === "paused" && (
                <button
                  onClick={resumeBatchSend}
                  className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Devam Et"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              {(batchProgress.status === "running" || batchProgress.status === "paused") && (
                <button
                  onClick={cancelBatchSend}
                  className="p-1.5 rounded-md text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                  title="İptal Et"
                >
                  <Square className="w-4 h-4" />
                </button>
              )}
              {(batchProgress.status === "completed" || batchProgress.status === "cancelled") && (
                <button
                  onClick={clearBatchSend}
                  className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Current Item */}
          {batchProgress.currentItem && batchProgress.status === "running" && (
            <div className="flex items-center gap-2 mb-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-info)]" />
              <span className="text-[var(--color-muted-foreground)]">İşleniyor:</span>
              <span className="font-medium text-[var(--color-foreground)]">
                {batchProgress.currentItem.label}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                ({batchProgress.currentItem.type === "invoice" ? "Fatura" : "Kontrat"})
              </span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)] mb-1">
              <span>İlerleme</span>
              <span>{batchProgress.current} / {batchProgress.total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-info)] transition-all duration-300"
                style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-[var(--color-success)]">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{batchProgress.sent}</span>
              <span className="text-[var(--color-muted-foreground)]">başarılı</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--color-error)]">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">{batchProgress.failed}</span>
              <span className="text-[var(--color-muted-foreground)]">başarısız</span>
            </div>
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
            onSendEmail={() => handleSend(["email"])}
            onSendSms={() => handleSend(["sms"])}
            onSendAll={() => handleSend(["email", "sms"])}
            globalSelectedCount={selected.length}
            isSending={batchProgress.status === "running" || batchProgress.status === "paused"}
          />
        )}
        {queueTab === "yearly-contracts" && (
          <YearlyContractQueueGrid
            data={yearlyContractData?.data ?? []}
            loading={yearlyContractsLoading}
            onSelectionChanged={handleContractSelectionChanged}
            onPreviewEmail={handlePreviewEmail}
            onPreviewSms={handlePreviewSms}
            onSendEmail={() => handleSend(["email"])}
            onSendSms={() => handleSend(["sms"])}
            onSendAll={() => handleSend(["email", "sms"])}
            globalSelectedCount={selected.length}
            isSending={batchProgress.status === "running" || batchProgress.status === "paused"}
          />
        )}
        {queueTab === "monthly-contracts" && (
          <ContractQueueGrid
            data={monthlyContractData?.data ?? []}
            loading={monthlyContractsLoading}
            onSelectionChanged={handleContractSelectionChanged}
            onPreviewEmail={handlePreviewEmail}
            onPreviewSms={handlePreviewSms}
            onSendEmail={() => handleSend(["email"])}
            onSendSms={() => handleSend(["sms"])}
            onSendAll={() => handleSend(["email", "sms"])}
            globalSelectedCount={selected.length}
            isSending={batchProgress.status === "running" || batchProgress.status === "paused"}
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
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
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
                      ? "bg-[var(--color-success)] text-[var(--color-success-foreground)]"
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
                      <div className="px-3 py-2 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-md text-[var(--color-foreground)] whitespace-pre-wrap">
                        {previewData.body}
                      </div>
                    )}
                  </div>

                  <div className="p-2 bg-[var(--color-info)]/10 rounded text-xs text-[var(--color-info)]">
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

      {/* Duplicate warning modal */}
      <DuplicateSendWarningModal
        isOpen={duplicateWarning !== null}
        duplicates={duplicateWarning?.duplicates ?? []}
        totalSelected={selected.length}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
      />
    </div>
  );
}
