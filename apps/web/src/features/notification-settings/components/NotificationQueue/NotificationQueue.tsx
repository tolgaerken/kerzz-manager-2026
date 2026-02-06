import { useState, useCallback } from "react";
import {
  RefreshCw,
  Mail,
  MessageSquare,
  FileText,
  Building,
  ChevronLeft,
  ChevronRight,
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
} from "../../hooks";
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
    page: 1,
    limit: 20,
  });
  const [contractParams, setContractParams] = useState<ContractQueueQueryParams>({
    remainingDaysMax: 90,
    page: 1,
    limit: 20,
  });
  const [selected, setSelected] = useState<ManualSendItem[]>([]);
  const [resultModal, setResultModal] = useState<{
    sent: number;
    failed: number;
    results: { type: string; id: string; channel: string; success: boolean; error?: string }[];
  } | null>(null);
  const [previewParams, setPreviewParams] = useState<QueuePreviewParams | null>(null);

  const { data: stats, isLoading: statsLoading } = useQueueStats();
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoiceQueue(invoiceParams);
  const { data: contractData, isLoading: contractsLoading } = useContractQueue(contractParams);
  const sendMutation = useSendManualNotification();
  const { data: previewData, isLoading: previewLoading } = useQueuePreview(previewParams);

  const toggleInvoice = useCallback((item: QueueInvoiceItem) => {
    setSelected((prev) => {
      const exists = prev.some((s) => s.type === "invoice" && s.id === item.id);
      if (exists) return prev.filter((s) => !(s.type === "invoice" && s.id === item.id));
      return [...prev, { type: "invoice" as const, id: item.id }];
    });
  }, []);

  const toggleContract = useCallback((item: QueueContractItem) => {
    setSelected((prev) => {
      const exists = prev.some((s) => s.type === "contract" && s.id === item.id);
      if (exists) return prev.filter((s) => !(s.type === "contract" && s.id === item.id));
      return [...prev, { type: "contract" as const, id: item.id }];
    });
  }, []);

  const selectAllInvoices = useCallback(() => {
    if (!invoiceData?.data.length) return;
    const currentIds = new Set(selected.filter((s) => s.type === "invoice").map((s) => s.id));
    const allSelected = invoiceData.data.every((i) => currentIds.has(i.id));
    if (allSelected) {
      setSelected((prev) => prev.filter((s) => s.type !== "invoice"));
    } else {
      const other = selected.filter((s) => s.type !== "invoice");
      setSelected([
        ...other,
        ...invoiceData.data.map((i) => ({ type: "invoice" as const, id: i.id })),
      ]);
    }
  }, [invoiceData?.data, selected]);

  const selectAllContracts = useCallback(() => {
    if (!contractData?.data.length) return;
    const currentIds = new Set(selected.filter((s) => s.type === "contract").map((s) => s.id));
    const allSelected = contractData.data.every((i) => currentIds.has(i.id));
    if (allSelected) {
      setSelected((prev) => prev.filter((s) => s.type !== "contract"));
    } else {
      const other = selected.filter((s) => s.type !== "contract");
      setSelected([
        ...other,
        ...contractData.data.map((i) => ({ type: "contract" as const, id: i.id })),
      ]);
    }
  }, [contractData?.data, selected]);

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);

  const isInvoiceSelected = (id: string) => selected.some((s) => s.type === "invoice" && s.id === id);
  const isContractSelected = (id: string) => selected.some((s) => s.type === "contract" && s.id === id);

  return (
    <div className="space-y-4">
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
                page: 1,
              }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          >
            <option value="all">Tümü</option>
            <option value="due">Vadesi bugün</option>
            <option value="overdue">Vadesi geçmiş</option>
          </select>
          <input
            type="text"
            placeholder="Ara (fatura no, açıklama...)"
            value={invoiceParams.search ?? ""}
            onChange={(e) =>
              setInvoiceParams((p) => ({ ...p, search: e.target.value || undefined, page: 1 }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-64"
          />
          <button
            onClick={() =>
              setInvoiceParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
            }
            disabled={!invoiceData?.meta || invoiceData.meta.page <= 1}
            className="p-2 text-[var(--color-foreground)] disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
      {queueTab === "contracts" && (
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="number"
            placeholder="Kalan gün (max)"
            value={contractParams.remainingDaysMax ?? ""}
            onChange={(e) =>
              setContractParams((p) => ({
                ...p,
                remainingDaysMax: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)] w-36"
          />
          <input
            type="text"
            placeholder="Ara (firma, marka...)"
            value={contractParams.search ?? ""}
            onChange={(e) =>
              setContractParams((p) => ({ ...p, search: e.target.value || undefined, page: 1 }))
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

      {/* Table */}
      <div className="overflow-x-auto bg-[var(--color-surface-elevated)] rounded-lg">
        {queueTab === "invoices" && (
          <>
            {invoicesLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          invoiceData?.data.length
                            ? invoiceData.data.every((i) => isInvoiceSelected(i.id))
                            : false
                        }
                        onChange={selectAllInvoices}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Fatura No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Müşteri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Tutar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Son Ödeme
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Geciken Gün
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Son Bildirim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Bildirim Sayısı
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData?.data.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isInvoiceSelected(row.id)}
                          onChange={() => toggleInvoice(row)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-[var(--color-foreground)]">
                        {row.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.customer.companyName || row.customer.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {formatCurrency(row.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            row.overdueDays > 0
                              ? "text-red-600 font-medium"
                              : "text-[var(--color-muted)]"
                          }
                        >
                          {row.overdueDays}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                        {row.lastNotify ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.notifyCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setPreviewParams({ type: "invoice", id: row.id, channel: "email" })
                            }
                            title="E-posta Önizleme"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setPreviewParams({ type: "invoice", id: row.id, channel: "sms" })
                            }
                            title="SMS Önizleme"
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!invoiceData?.data || invoiceData.data.length === 0) && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-[var(--color-muted)]"
                      >
                        Bildirim bekleyen fatura bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {queueTab === "contracts" && (
          <>
            {contractsLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          contractData?.data.length
                            ? contractData.data.every((i) => isContractSelected(i.id))
                            : false
                        }
                        onChange={selectAllContracts}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Kontrat / Firma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Müşteri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Bitiş Tarihi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      Kalan Gün
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      İletişim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contractData?.data.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                    >
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isContractSelected(row.id)}
                          onChange={() => toggleContract(row)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        <div>
                          <p className="font-medium">{row.contractId || row.company}</p>
                          {row.brand && (
                            <p className="text-xs text-[var(--color-muted)]">{row.brand}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.customer.companyName || row.customer.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.endDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                        {row.remainingDays}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                        {row.customer.email || row.customer.phone || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setPreviewParams({ type: "contract", id: row.id, channel: "email" })
                            }
                            title="E-posta Önizleme"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setPreviewParams({ type: "contract", id: row.id, channel: "sms" })
                            }
                            title="SMS Önizleme"
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!contractData?.data || contractData.data.length === 0) && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[var(--color-muted)]"
                      >
                        Bildirim bekleyen kontrat bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {queueTab === "invoices" && invoiceData?.meta && invoiceData.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface-elevated)] rounded-lg">
          <div className="text-sm text-[var(--color-muted)]">
            Toplam {invoiceData.meta.total} kayıt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInvoiceParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              disabled={invoiceData.meta.page === 1}
              className="p-2 text-[var(--color-foreground)] disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-[var(--color-foreground)]">
              {invoiceData.meta.page} / {invoiceData.meta.totalPages}
            </span>
            <button
              onClick={() => setInvoiceParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              disabled={invoiceData.meta.page === invoiceData.meta.totalPages}
              className="p-2 text-[var(--color-foreground)] disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {queueTab === "contracts" && contractData?.meta && contractData.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface-elevated)] rounded-lg">
          <div className="text-sm text-[var(--color-muted)]">
            Toplam {contractData.meta.total} kayıt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContractParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              disabled={contractData.meta.page === 1}
              className="p-2 text-[var(--color-foreground)] disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-[var(--color-foreground)]">
              {contractData.meta.page} / {contractData.meta.totalPages}
            </span>
            <button
              onClick={() => setContractParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              disabled={contractData.meta.page === contractData.meta.totalPages}
              className="p-2 text-[var(--color-foreground)] disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

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
                {/* Kanal değiştirme butonları */}
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
                  {/* Recipient info */}
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

                  {/* Subject */}
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

                  {/* Body */}
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
