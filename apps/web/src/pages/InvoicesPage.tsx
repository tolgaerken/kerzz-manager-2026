import { useState, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, FileSpreadsheet, CreditCard, Loader2, AlertTriangle, CheckCircle, X, MessageSquare, Receipt, FileText } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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
import { useErpBalances } from "../features/erp-balances/hooks";

// Yıl ve ay'dan tarih aralığı hesapla
function getDateRangeFromYearMonth(year: number, month: number): { startDate: string; endDate: string } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0]
  };
}

// Preset'ten yıl ve ay hesapla
function getYearMonthFromPreset(preset: string): { year: number; month: number } {
  const now = new Date();
  
  switch (preset) {
    case "currentMonth":
      return { year: now.getFullYear(), month: now.getMonth() };
    case "lastMonth":
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { year: lastMonth.getFullYear(), month: lastMonth.getMonth() };
    default:
      return { year: now.getFullYear(), month: now.getMonth() };
  }
}

export function InvoicesPage() {
  // Yıl ve ay state - default olarak bu ay
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  
  // Query state - default olarak bu ayı seç
  const defaultDates = getDateRangeFromYearMonth(now.getFullYear(), now.getMonth());
  
  const [queryParams, setQueryParams] = useState<InvoiceQueryParams>({
    page: 1,
    limit: 1000, // 100000'den 1000'e düşürüldü - performans iyileştirmesi
    search: "",
    invoiceType: "",
    sortField: "invoiceDate",
    sortOrder: "desc",
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate
  });

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

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

  // ERP Bakiye verileri - Cari bakiye için
  const { data: erpBalancesData } = useErpBalances({ limit: 5000 }); // 100000'den 5000'e düşürüldü

  // erpId (CariKodu) -> CariBakiye eşleştirmesi
  const balanceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (erpBalancesData?.data) {
      for (const balance of erpBalancesData.data) {
        map.set(balance.CariKodu, balance.CariBakiye);
      }
    }
    return map;
  }, [erpBalancesData]);

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

  // Yıl değişikliği - sadece state güncelle, sorgu yapma
  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  // Ay değişikliği - sadece state güncelle, sorgu yapma
  const handleMonthChange = useCallback((month: number) => {
    setSelectedMonth(month);
  }, []);

  // Yıl/Ay seçimine göre getir
  const handleFetchByYearMonth = useCallback(() => {
    const { startDate, endDate } = getDateRangeFromYearMonth(selectedYear, selectedMonth);
    setQueryParams((prev) => ({ ...prev, startDate, endDate, page: 1 }));
  }, [selectedYear, selectedMonth]);

  // Preset butonları - hem yıl/ay state'ini güncelle hem de sorgu yap
  const handleDatePresetChange = useCallback((preset: string) => {
    const { year, month } = getYearMonthFromPreset(preset);
    setSelectedYear(year);
    setSelectedMonth(month);
    
    const { startDate, endDate } = getDateRangeFromYearMonth(year, month);
    setQueryParams((prev) => ({ ...prev, startDate, endDate, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      invoiceType: "",
      isPaid: undefined,
      internalFirm: "",
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

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileText className="h-5 w-5" />,
    title: "Faturalar",
    count: data?.data?.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={handleExportExcel}
          disabled={isLoading || !data?.data?.length}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Excel
        </button>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportExcel}
          disabled={isLoading || !data?.data?.length}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>
    ),
    children: (
      <InvoicesFilters
        search={queryParams.search || ""}
        invoiceType={(queryParams.invoiceType as InvoiceType) || ""}
        isPaid={queryParams.isPaid}
        internalFirm={queryParams.internalFirm || ""}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        counts={data?.counts}
        onSearchChange={handleSearchChange}
        onInvoiceTypeChange={handleInvoiceTypeChange}
        onIsPaidChange={handleIsPaidChange}
        onInternalFirmChange={handleInternalFirmChange}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        onDatePresetChange={handleDatePresetChange}
        onFetchByYearMonth={handleFetchByYearMonth}
        onClearFilters={handleClearFilters}
      />
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Payment Notification */}
      {paymentNotification && (
        <div
          className="flex items-center gap-3 mx-0 mb-3 px-4 py-3 rounded-lg text-sm"
          style={{
            backgroundColor:
              paymentNotification.type === "error"
                ? "color-mix(in oklch, var(--color-error) 12%, var(--color-surface))"
                : "color-mix(in oklch, var(--color-success) 12%, var(--color-surface))",
            color:
              paymentNotification.type === "error"
                ? "var(--color-error-foreground)"
                : "var(--color-success-foreground)",
            borderWidth: "1px",
            borderStyle: "solid",
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

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Error State */}
        {error && (
          <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
            <div>
              <p className="font-medium">Veri yüklenirken hata oluştu</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto rounded-lg border border-error/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-error/20"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <InvoicesGrid
            data={data?.data || []}
            loading={isLoading}
            autoPaymentCustomerIds={autoPaymentCustomerIds}
            pendingPaymentInvoiceNos={pendingPaymentInvoiceNos}
            balanceMap={balanceMap}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            customButtons={toolbarCustomButtons}
          />
        </div>
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
