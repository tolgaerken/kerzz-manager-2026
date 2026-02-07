import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, FileSpreadsheet } from "lucide-react";
import { useAutoPaymentTokens } from "../features/automated-payments/hooks/useAutoPaymentTokens";
import {
  InvoicesGrid,
  InvoicesFilters,
  InvoiceFormModal,
  useInvoices,
  useUpdateInvoice,
  invoicesKeys
} from "../features/invoices";
import type {
  Invoice,
  InvoiceQueryParams,
  InvoiceType,
  UpdateInvoiceInput
} from "../features/invoices";

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

  // Queries & Mutations
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching, error } = useInvoices(queryParams);
  const updateMutation = useUpdateInvoice();
  const { data: tokensData } = useAutoPaymentTokens({});

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
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
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
    </div>
  );
}
