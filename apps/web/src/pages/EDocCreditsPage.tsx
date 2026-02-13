import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Pencil, Trash2, FileText, Coins } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  EDocCreditsGrid,
  EDocCreditFormModal,
  EDocCreditFilters,
  useEDocCredits,
  useCreateEDocCredit,
  useUpdateEDocCredit,
  useDeleteEDocCredit,
  useCreateInvoiceForCredit,
  eDocCreditKeys,
} from "../features/e-doc-credits";
import type {
  EDocCreditItem,
  EDocCreditQueryParams,
  EDocCreditFormData,
} from "../features/e-doc-credits";
import { AccountTransactionsModal } from "../features/account-transactions";

export function EDocCreditsPage() {
  // -- Query State --
  const [queryParams, setQueryParams] = useState<EDocCreditQueryParams>(() => {
    const now = new Date();
    return {
      search: "",
      currency: "",
      internalFirm: "",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      sortField: "date",
      sortOrder: "desc",
    };
  });

  // -- Collapsible Section State --
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // -- Selection State --
  const [selectedItem, setSelectedItem] = useState<EDocCreditItem | null>(null);

  // -- Modal State --
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<EDocCreditItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInvoiceConfirmOpen, setIsInvoiceConfirmOpen] = useState(false);

  // -- Queries --
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useEDocCredits(queryParams);

  // -- Refresh Handler --
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eDocCreditKeys.lists() });
  }, [queryClient]);

  // -- Mutations --
  const createMutation = useCreateEDocCredit();
  const updateMutation = useUpdateEDocCredit();
  const deleteMutation = useDeleteEDocCredit();
  const invoiceMutation = useCreateInvoiceForCredit();

  // -- Filter Handlers --
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, []);

  const handleCurrencyChange = useCallback((currency: string) => {
    setQueryParams((prev) => ({ ...prev, currency }));
  }, []);

  const handleInternalFirmChange = useCallback((internalFirm: string) => {
    setQueryParams((prev) => ({ ...prev, internalFirm }));
  }, []);

  const handleMonthYearChange = useCallback((monthYear: string) => {
    if (monthYear) {
      const [yearStr, monthStr] = monthYear.split("-");
      setQueryParams((prev) => ({
        ...prev,
        year: parseInt(yearStr, 10),
        month: parseInt(monthStr, 10),
      }));
    } else {
      setQueryParams((prev) => ({
        ...prev,
        year: undefined,
        month: undefined,
      }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      currency: "",
      internalFirm: "",
      month: undefined,
      year: undefined,
    }));
  }, []);

  // -- Selection Handlers --
  const handleSelectionChanged = useCallback(
    (item: EDocCreditItem | null) => {
      setSelectedItem(item);
    },
    []
  );

  const handleRowDoubleClick = useCallback((item: EDocCreditItem) => {
    setEditItem(item);
    setIsFormOpen(true);
  }, []);

  // -- CRUD Handlers --
  const handleAdd = useCallback(() => {
    setEditItem(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedItem) return;
    setEditItem(selectedItem);
    setIsFormOpen(true);
  }, [selectedItem]);

  const handleFormSubmit = useCallback(
    async (formData: EDocCreditFormData) => {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
      setEditItem(null);
      setSelectedItem(null);
    },
    [editItem, createMutation, updateMutation]
  );

  const handleDeleteClick = useCallback(() => {
    if (!selectedItem) return;
    setIsDeleteConfirmOpen(true);
  }, [selectedItem]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    await deleteMutation.mutateAsync(selectedItem.id);
    setIsDeleteConfirmOpen(false);
    setSelectedItem(null);
  }, [selectedItem, deleteMutation]);

  // -- Invoice Handlers --
  const handleCreateInvoiceClick = useCallback(() => {
    if (!selectedItem) return;
    setIsInvoiceConfirmOpen(true);
  }, [selectedItem]);

  const handleCreateInvoiceConfirm = useCallback(async () => {
    if (!selectedItem) return;
    try {
      await invoiceMutation.mutateAsync(selectedItem.id);
      setIsInvoiceConfirmOpen(false);
      setSelectedItem(null);
    } catch {
      // Hata hook tarafından yönetilir
    }
  }, [selectedItem, invoiceMutation]);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    invoiceMutation.isPending;

  // Para birimi etiketi
  const getCurrencyLabel = (currency: string) => {
    const map: Record<string, string> = { tl: "TL", usd: "USD", eur: "EUR" };
    return map[currency] || currency?.toUpperCase() || "TL";
  };

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Coins className="h-5 w-5" />,
    title: "Kontör Yüklemeleri",
    count: data?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        {selectedItem && (
          <>
            <button
              type="button"
              onClick={handleCreateInvoiceClick}
              disabled={invoiceMutation.isPending}
              className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Fatura Oluştur
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Düzenle
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex items-center justify-center gap-1.5 rounded-md bg-[var(--color-error)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Sil
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Kontör Yükleme
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`} />
        </button>
        {selectedItem && (
          <>
            <button
              type="button"
              onClick={handleCreateInvoiceClick}
              disabled={invoiceMutation.isPending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[var(--color-error)]/10 px-3 py-2 text-xs font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)]/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <>
        <EDocCreditFilters
          search={queryParams.search || ""}
          currency={queryParams.currency || ""}
          internalFirm={queryParams.internalFirm || ""}
          monthYear={
            queryParams.year && queryParams.month
              ? `${queryParams.year}-${String(queryParams.month).padStart(2, "0")}`
              : ""
          }
          onSearchChange={handleSearchChange}
          onCurrencyChange={handleCurrencyChange}
          onInternalFirmChange={handleInternalFirmChange}
          onMonthYearChange={handleMonthYearChange}
          onClearFilters={handleClearFilters}
        />
        {/* Stats Bar */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            Toplam Kayıt:{" "}
            <span className="font-semibold text-foreground">
              {data?.total ?? 0}
            </span>
          </span>
          {selectedItem && (
            <span className="text-muted-foreground">
              Seçili:{" "}
              <span className="font-semibold text-foreground">
                {selectedItem.erpId}
              </span>
            </span>
          )}
        </div>
      </>
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <EDocCreditsGrid
            data={data?.data ?? []}
            loading={isLoading}
            onSelectionChanged={handleSelectionChanged}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
      </div>

      {/* Form Modal */}
      <EDocCreditFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleFormSubmit}
        editItem={editItem}
        loading={isMutating}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface border border-border rounded-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Kaydı Sil
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Bu kontör yükleme kaydını silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-surface-elevated border border-border rounded-md hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-error-foreground)] bg-[var(--color-error)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteMutation.isPending && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    </svg>
                  )}
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Confirmation Dialog */}
      {isInvoiceConfirmOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsInvoiceConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface border border-border rounded-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Fatura Oluşturma Onayı
              </h3>

              {selectedItem.invoiceNumber && selectedItem.invoiceNumber.trim() !== "" && (
                <div className="mb-4 p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg">
                  <p className="text-sm text-[var(--color-warning)] font-medium">
                    Bu kayıt için zaten fatura oluşturulmuş: {selectedItem.invoiceNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Devam ederseniz yeni bir fatura oluşturulacaktır.
                  </p>
                </div>
              )}

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Müşteri (ERP):</span>
                  <span className="font-medium text-foreground">{selectedItem.erpId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adet:</span>
                  <span className="font-medium text-foreground">{selectedItem.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Birim Fiyat:</span>
                  <span className="font-medium text-foreground">
                    {selectedItem.price?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {getCurrencyLabel(selectedItem.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="text-muted-foreground font-semibold">Toplam Tutar:</span>
                  <span className="font-bold text-foreground">
                    {selectedItem.total?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {getCurrencyLabel(selectedItem.currency)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Yukarıdaki bilgilerle e-fatura oluşturulacaktır. Devam etmek istiyor musunuz?
              </p>

              {invoiceMutation.isError && (
                <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg">
                  <p className="text-sm text-[var(--color-error)]">
                    {(invoiceMutation.error as Error)?.message || "Fatura oluşturulurken hata oluştu"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsInvoiceConfirmOpen(false);
                    invoiceMutation.reset();
                  }}
                  disabled={invoiceMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-surface-elevated border border-border rounded-md hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoiceConfirm}
                  disabled={invoiceMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {invoiceMutation.isPending && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="opacity-25"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-75"
                      />
                    </svg>
                  )}
                  Fatura Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
