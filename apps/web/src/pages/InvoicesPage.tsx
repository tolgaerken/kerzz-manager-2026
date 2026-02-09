import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, FileSpreadsheet, CreditCard, Loader2, AlertTriangle, CheckCircle, X, MessageSquare, Receipt } from "lucide-react";
import { useAutoPaymentTokens } from "../features/automated-payments/hooks/useAutoPaymentTokens";
import { useCollectPayment } from "../features/automated-payments";
import { useMongoChangeStream } from "../hooks/useMongoChangeStream";
import {
  InvoicesGrid,
  InvoicesFilters,
  InvoiceFormModal,
  BatchCollectProgressModal,
  FloatingCollectProgressBar,
  useInvoices,
  useUpdateInvoice,
  useBatchCollectPayment,
  invoicesKeys
} from "../features/invoices";
import type {
  Invoice,
  InvoiceQueryParams,
  InvoiceType,
  UpdateInvoiceInput
} from "../features/invoices";
import { useLogPanelStore } from "../features/manager-log";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

// Tarih preset hesaplama
function getDatePresetRange(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (preset) {
    case "currentMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "currentQuarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      break;
    case "last30Days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case "last90Days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    default:
      return { startDate: "", endDate: "" };
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0]
  };
}

export function InvoicesPage() {
  // Query state - default olarak bu ayı seç
  const defaultDates = getDatePresetRange("currentMonth");
  
  const [queryParams, setQueryParams] = useState<InvoiceQueryParams>({
    page: 1,
    limit: 100000,
    search: "",
    invoiceType: "",
    sortField: "invoiceDate",
    sortOrder: "desc",
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate
  });

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Tahsilat bildirim state
  const [paymentNotification, setPaymentNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tahsilat loading state
  const [collectLoading, setCollectLoading] = useState(false);

  // Odeme sonucu beklenen fatura numaralari (spinner gosterimi icin)
  const [pendingPaymentInvoiceNos, setPendingPaymentInvoiceNos] = useState<Set<string>>(new Set());

  // Bildirimi 8 saniye sonra otomatik kapat
  useEffect(() => {
    if (!paymentNotification) return;
    const timer = setTimeout(() => setPaymentNotification(null), 8000);
    return () => clearTimeout(timer);
  }, [paymentNotification]);

  // Queries & Mutations
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching, error } = useInvoices(queryParams);
  const updateMutation = useUpdateInvoice();
  const { data: tokensData } = useAutoPaymentTokens({});
  const collectMutation = useCollectPayment();
  const batchCollect = useBatchCollectPayment();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // MongoDB Change Stream - global-invoices degisikliklerini dinle
  useMongoChangeStream("global-invoices", (event) => {
    const fields = event.updatedFields;
    const doc = event.fullDocument;

    // isPaid veya paymentSuccessDate degistiyse fatura listesini yenile
    if (
      fields?.isPaid !== undefined ||
      fields?.paymentSuccessDate !== undefined
    ) {
      // Pending set'ten cikar
      const invoiceNumber = doc?.invoiceNumber as string | undefined;
      if (invoiceNumber) {
        setPendingPaymentInvoiceNos((prev) => {
          if (!prev.has(invoiceNumber)) return prev;
          const next = new Set(prev);
          next.delete(invoiceNumber);
          return next;
        });
      }
      queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
    }
  });

  // MongoDB Change Stream - online-payments degisikliklerini dinle (hata takibi)
  useMongoChangeStream("online-payments", (event) => {
    const fields = event.updatedFields;
    const doc = event.fullDocument;

    if (fields?.status === undefined || !doc) return;

    const invoiceNo = doc.invoiceNo as string | undefined;
    if (!invoiceNo) return;

    // Bu fatura bizim bekledigimiz faturalardan biri mi?
    setPendingPaymentInvoiceNos((prev) => {
      if (!prev.has(invoiceNo)) return prev;

      const status = fields.status as string;
      const statusMessage = (fields.statusMessage ?? doc.statusMessage ?? "") as string;

      if (status !== "success") {
        // Basarisiz odeme - hata toast goster
        setPaymentNotification({
          type: "error",
          message: statusMessage || "Ödeme işlemi başarısız oldu",
        });
      }

      // Her durumda pending'den cikar (success durumunda global-invoices zaten yenileyecek)
      const next = new Set(prev);
      next.delete(invoiceNo);
      return next;
    });
  });

  // Refresh handler
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
  }, [queryClient]);

  // Otomatik ödeme talimatı kayıtlı müşteri ID'leri
  const autoPaymentCustomerIds = useMemo(() => {
    if (!tokensData?.data) return new Set<string>();
    return new Set(tokensData.data.map((t) => t.customerId));
  }, [tokensData]);

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleInvoiceTypeChange = useCallback((invoiceType: InvoiceType | "") => {
    setQueryParams((prev) => ({ ...prev, invoiceType, page: 1 }));
  }, []);

  const handleIsPaidChange = useCallback((isPaid: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, isPaid, page: 1 }));
  }, []);

  const handleInternalFirmChange = useCallback((internalFirm: string) => {
    setQueryParams((prev) => ({ ...prev, internalFirm, page: 1 }));
  }, []);

  const handleStartDateChange = useCallback((startDate: string) => {
    setQueryParams((prev) => ({ ...prev, startDate, page: 1 }));
  }, []);

  const handleEndDateChange = useCallback((endDate: string) => {
    setQueryParams((prev) => ({ ...prev, endDate, page: 1 }));
  }, []);

  const handleDatePresetChange = useCallback((preset: string) => {
    const { startDate, endDate } = getDatePresetRange(preset);
    setQueryParams((prev) => ({ ...prev, startDate, endDate, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      invoiceType: "",
      isPaid: undefined,
      internalFirm: "",
      startDate: "",
      endDate: "",
      page: 1
    }));
  }, []);

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSave = useCallback(
    (id: string, formData: UpdateInvoiceInput) => {
      updateMutation.mutate(
        { id, data: formData },
        {
          onSuccess: () => {
            setIsFormModalOpen(false);
            setSelectedInvoice(null);
          }
        }
      );
    },
    [updateMutation]
  );

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    // Son seçilen faturayı selectedInvoice olarak ayarla (log için)
    if (ids.length > 0 && data?.data) {
      const lastSelectedId = ids[ids.length - 1];
      const invoice = data.data.find((inv) => inv._id === lastSelectedId);
      if (invoice) {
        setSelectedInvoice(invoice);
      }
    } else if (ids.length === 0) {
      setSelectedInvoice(null);
    }
  }, [data?.data]);

  // Excel export (basit CSV)
  const handleExportExcel = useCallback(() => {
    if (!data?.data) return;
    
    const headers = ["Fatura No", "Müşteri", "Fatura Tarihi", "Son Ödeme", "Tutar", "KDV", "Genel Toplam", "Durum", "Firma"];
    const rows = data.data.map((inv) => [
      inv.invoiceNumber,
      inv.name,
      inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("tr-TR") : "",
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("tr-TR") : "",
      inv.total,
      inv.taxTotal,
      inv.grandTotal,
      inv.isPaid ? "Ödendi" : "Ödenmedi",
      inv.internalFirm
    ]);
    
    const csvContent = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `faturalar_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [data]);

  // Secili ve tahsil edilebilir faturaları bul
  const collectableInvoices = useMemo(() => {
    if (selectedIds.length === 0 || !data?.data) return [];
    return data.data.filter(
      (inv) =>
        selectedIds.includes(inv._id) &&
        !inv.isPaid &&
        autoPaymentCustomerIds.has(inv.customerId)
    );
  }, [selectedIds, data, autoPaymentCustomerIds]);

  // Tahsil edilebilir fatura var mi?
  const canCollect = collectableInvoices.length > 0;
  const isBatchRunning = batchCollect.progress?.status === "running";

  // Tekli tahsil et handler
  const handleSingleCollect = useCallback(async () => {
    if (collectableInvoices.length !== 1) return;
    const invoice = collectableInvoices[0];
    setCollectLoading(true);
    try {
      const result = await collectMutation.mutateAsync({
        customerId: invoice.customerId,
        amount: invoice.grandTotal,
        mode: "custom",
        invoiceNo: invoice.invoiceNumber,
      });
      if (!result.success) {
        setPaymentNotification({
          type: "error",
          message: result.paymentError || result.message,
        });
      } else {
        if (invoice.invoiceNumber) {
          setPendingPaymentInvoiceNos((prev) => new Set(prev).add(invoice.invoiceNumber));
        }
        setPaymentNotification({
          type: "success",
          message: result.message,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Tahsilat sırasında hata oluştu";
      setPaymentNotification({ type: "error", message: errorMessage });
    } finally {
      setCollectLoading(false);
    }
  }, [collectableInvoices, collectMutation]);

  // Çoklu tahsil et handler (batch modal ile)
  const handleBatchCollect = useCallback(() => {
    if (collectableInvoices.length === 0) return;
    batchCollect.startBatchCollect(collectableInvoices);
  }, [collectableInvoices, batchCollect]);

  // Tahsil et: tekli ise direkt, çoklu ise batch modal
  const handleCollectPayment = useCallback(() => {
    if (collectableInvoices.length === 1) {
      handleSingleCollect();
    } else {
      handleBatchCollect();
    }
  }, [collectableInvoices.length, handleSingleCollect, handleBatchCollect]);

  // Batch modal handler'ları
  const handleBatchMinimize = useCallback(() => {
    batchCollect.minimizeBatchCollect();
  }, [batchCollect]);

  const handleBatchMaximize = useCallback(() => {
    batchCollect.maximizeBatchCollect();
  }, [batchCollect]);

  const handleBatchPause = useCallback(() => {
    batchCollect.pauseBatchCollect();
  }, [batchCollect]);

  const handleBatchResume = useCallback(() => {
    batchCollect.resumeBatchCollect();
  }, [batchCollect]);

  const handleBatchCancel = useCallback(() => {
    batchCollect.cancelBatchCollect();
  }, [batchCollect]);

  const handleBatchClose = useCallback(() => {
    batchCollect.clearBatchCollect();
    // Batch tamamlaninca listeyi yenile
    queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
  }, [batchCollect, queryClient]);

  // Log panelini aç
  const handleOpenLogs = useCallback(() => {
    if (!selectedInvoice) return;
    openEntityPanel({
      customerId: selectedInvoice.customerId,
      activeTab: "invoice",
      invoiceId: selectedInvoice._id,
      contractId: selectedInvoice.contractId || undefined,
      title: `Fatura: ${selectedInvoice.invoiceNumber || selectedInvoice.name}`,
    });
  }, [selectedInvoice, openEntityPanel]);

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedInvoice?.erpId) return;
    openAccountTransactionsModal(selectedInvoice.erpId, selectedInvoice.internalFirm || "VERI");
  }, [selectedInvoice, openAccountTransactionsModal]);

  // Grid toolbar custom buttons
  const toolbarCustomButtons = useMemo(() => {
    const getLabel = () => {
      if (collectLoading || isBatchRunning) return "Tahsil Ediliyor...";
      if (collectableInvoices.length > 1) return `Tahsil Et (${collectableInvoices.length})`;
      return "Tahsil Et";
    };

    return [
      {
        id: "logs",
        label: "Loglar",
        icon: <MessageSquare className="w-4 h-4" />,
        onClick: handleOpenLogs,
        disabled: !selectedInvoice || selectedIds.length > 1,
      },
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="w-4 h-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: !selectedInvoice?.erpId || selectedIds.length > 1,
      },
      {
        id: "collect-payment",
        label: getLabel(),
        icon: collectLoading || isBatchRunning
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <CreditCard className="w-4 h-4" />,
        onClick: handleCollectPayment,
        disabled: !canCollect || collectLoading || isBatchRunning,
        variant: "primary" as const,
      },
    ];
  }, [canCollect, collectLoading, isBatchRunning, collectableInvoices.length, handleCollectPayment, selectedInvoice, selectedIds.length, handleOpenLogs, handleOpenAccountTransactions]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Faturalar
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isLoading || !data?.data?.length}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Excel'e Aktar"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || isRefetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Payment Notification */}
      {paymentNotification && (
        <div
          className="flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)] text-sm"
          style={{
            backgroundColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 12%, var(--color-surface))"
                : "color-mix(in oklch, var(--color-success) 12%, var(--color-surface))",
            color:
              paymentNotification.type === "error"
                ? "var(--color-error-foreground)"
                : "var(--color-success-foreground)",
            borderColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 30%, var(--color-border))"
                : "color-mix(in oklch, var(--color-success) 30%, var(--color-border))",
          }}
        >
          {paymentNotification.type === "error" ? (
            <AlertTriangle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--color-error)" }}
            />
          ) : (
            <CheckCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--color-success)" }}
            />
          )}
          <span className="flex-1 font-medium">{paymentNotification.message}</span>
          <button
            type="button"
            onClick={() => setPaymentNotification(null)}
            className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <InvoicesFilters
          search={queryParams.search || ""}
          invoiceType={(queryParams.invoiceType as InvoiceType) || ""}
          isPaid={queryParams.isPaid}
          internalFirm={queryParams.internalFirm || ""}
          startDate={queryParams.startDate || ""}
          endDate={queryParams.endDate || ""}
          counts={data?.counts}
          onSearchChange={handleSearchChange}
          onInvoiceTypeChange={handleInvoiceTypeChange}
          onIsPaidChange={handleIsPaidChange}
          onInternalFirmChange={handleInternalFirmChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onDatePresetChange={handleDatePresetChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50 dark:bg-red-900/20">
          Hata: {error.message}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <InvoicesGrid
          data={data?.data || []}
          loading={isLoading}
          autoPaymentCustomerIds={autoPaymentCustomerIds}
          pendingPaymentInvoiceNos={pendingPaymentInvoiceNos}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          customButtons={toolbarCustomButtons}
        />
      </div>

      {/* Form Modal */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        invoice={selectedInvoice}
        onSave={handleFormSave}
        isLoading={updateMutation.isPending}
      />

      {/* Batch Collect Progress Modal (full screen) */}
      {batchCollect.progress && !batchCollect.progress.isMinimized && (
        <BatchCollectProgressModal
          progress={batchCollect.progress}
          onMinimize={handleBatchMinimize}
          onPause={handleBatchPause}
          onResume={handleBatchResume}
          onCancel={handleBatchCancel}
          onClose={handleBatchClose}
        />
      )}

      {/* Floating Collect Progress Bar (minimized) */}
      {batchCollect.progress && batchCollect.progress.isMinimized && (
        <FloatingCollectProgressBar
          progress={batchCollect.progress}
          onMaximize={handleBatchMaximize}
          onPause={handleBatchPause}
          onResume={handleBatchResume}
          onCancel={handleBatchCancel}
          onClose={handleBatchClose}
        />
      )}

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
