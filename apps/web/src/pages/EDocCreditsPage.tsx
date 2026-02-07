import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Pencil, Trash2, FileText } from "lucide-react";
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
    debugger;
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Kontor Yuklemeleri
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
            E-belge kontor yukleme kayitlarini yonetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading || isRefetching ? "animate-spin" : ""}`}
            />
          </button>

          {selectedItem && (
            <>
              <button
                type="button"
                onClick={handleCreateInvoiceClick}
                disabled={invoiceMutation.isPending}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                title="Fatura Olustur"
              >
                <FileText className="w-4 h-4" />
                <span>Fatura Olustur</span>
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
                title="Duzenle"
              >
                <Pencil className="w-4 h-4" />
                <span>Duzenle</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-error)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kontor Yukleme</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[var(--color-border)]">
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
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-[var(--color-muted-foreground)]">
            Toplam Kayit:{" "}
            <span className="font-semibold text-[var(--color-foreground)]">
              {data?.total ?? 0}
            </span>
          </span>
          {selectedItem && (
            <span className="text-[var(--color-muted-foreground)]">
              Secili:{" "}
              <span className="font-semibold text-[var(--color-foreground)]">
                {selectedItem.erpId}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <EDocCreditsGrid
          data={data?.data ?? []}
          loading={isLoading}
          onSelectionChanged={handleSelectionChanged}
          onRowDoubleClick={handleRowDoubleClick}
        />
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
          <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                Kaydi Sil
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                Bu kontor yukleme kaydini silmek istediginizden emin misiniz?
                Bu islem geri alinamaz.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
                >
                  Iptal
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
          <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                Fatura Olusturma Onayi
              </h3>

              {selectedItem.invoiceNumber && selectedItem.invoiceNumber.trim() !== "" && (
                <div className="mb-4 p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg">
                  <p className="text-sm text-[var(--color-warning)] font-medium">
                    Bu kayit icin zaten fatura olusturulmus: {selectedItem.invoiceNumber}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                    Devam ederseniz yeni bir fatura olusturulacaktir.
                  </p>
                </div>
              )}

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Musteri (ERP):</span>
                  <span className="font-medium text-[var(--color-foreground)]">{selectedItem.erpId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Adet:</span>
                  <span className="font-medium text-[var(--color-foreground)]">{selectedItem.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">Birim Fiyat:</span>
                  <span className="font-medium text-[var(--color-foreground)]">
                    {selectedItem.price?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {getCurrencyLabel(selectedItem.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-[var(--color-border)] pt-2">
                  <span className="text-[var(--color-muted-foreground)] font-semibold">Toplam Tutar:</span>
                  <span className="font-bold text-[var(--color-foreground)]">
                    {selectedItem.total?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {getCurrencyLabel(selectedItem.currency)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                Yukaridaki bilgilerle e-fatura olusturulacaktir. Devam etmek istiyor musunuz?
              </p>

              {invoiceMutation.isError && (
                <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg">
                  <p className="text-sm text-[var(--color-error)]">
                    {(invoiceMutation.error as Error)?.message || "Fatura olusturulurken hata olustu"}
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
                  className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
                >
                  Iptal
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoiceConfirm}
                  disabled={invoiceMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
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
                  Fatura Olustur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
