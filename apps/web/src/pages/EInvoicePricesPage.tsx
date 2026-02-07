import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  Copy,
  Trash,
} from "lucide-react";
import {
  EInvoicePricesGrid,
  EInvoicePriceFormModal,
  EInvoicePriceFilters,
  useEInvoicePrices,
  useCreateEInvoicePrice,
  useUpdateEInvoicePrice,
  useDeleteEInvoicePrice,
  useBulkUpsertEInvoicePrices,
  useDeleteCustomerPrices,
  eInvoicePriceKeys,
} from "../features/e-invoice-prices";
import type {
  EInvoicePriceItem,
  EInvoicePriceQueryParams,
  EInvoicePriceFormData,
} from "../features/e-invoice-prices";

export function EInvoicePricesPage() {
  // -- Query State --
  const [queryParams, setQueryParams] = useState<EInvoicePriceQueryParams>({
    search: "",
    customerErpId: "",
    sortField: "sequence",
    sortOrder: "asc",
  });

  // -- Customer State --
  const [selectedCustomerErpId, setSelectedCustomerErpId] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [copiedFromMaster, setCopiedFromMaster] = useState<
    EInvoicePriceItem[] | null
  >(null);

  // -- Selection State --
  const [selectedItem, setSelectedItem] = useState<EInvoicePriceItem | null>(
    null,
  );

  // -- Modal State --
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<EInvoicePriceItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteCustomerConfirmOpen, setIsDeleteCustomerConfirmOpen] =
    useState(false);

  // -- Queries --
  const queryClient = useQueryClient();

  // Master kayitlari (customerErpId = "")
  const masterQuery = useEInvoicePrices({
    ...queryParams,
    customerErpId: "",
  });

  // Musteri kayitlari (eger musteri secili ise)
  const customerQuery = useEInvoicePrices({
    ...queryParams,
    customerErpId: selectedCustomerErpId || undefined,
  });

  // Gosterilecek veri
  const displayData = useMemo(() => {
    if (copiedFromMaster) return copiedFromMaster;
    if (selectedCustomerErpId) {
      return customerQuery.data?.data ?? [];
    }
    return masterQuery.data?.data ?? [];
  }, [
    selectedCustomerErpId,
    masterQuery.data,
    customerQuery.data,
    copiedFromMaster,
  ]);

  const isLoading = selectedCustomerErpId
    ? customerQuery.isLoading
    : masterQuery.isLoading;
  const isRefetching = selectedCustomerErpId
    ? customerQuery.isRefetching
    : masterQuery.isRefetching;
  const totalCount = copiedFromMaster
    ? copiedFromMaster.length
    : selectedCustomerErpId
      ? (customerQuery.data?.total ?? 0)
      : (masterQuery.data?.total ?? 0);

  // -- Refresh Handler --
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eInvoicePriceKeys.lists() });
    setCopiedFromMaster(null);
    setIsDirty(false);
  }, [queryClient]);

  // -- Mutations --
  const createMutation = useCreateEInvoicePrice();
  const updateMutation = useUpdateEInvoicePrice();
  const deleteMutation = useDeleteEInvoicePrice();
  const bulkUpsertMutation = useBulkUpsertEInvoicePrices();
  const deleteCustomerMutation = useDeleteCustomerPrices();

  // -- Filter Handlers --
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, []);

  const handleCustomerChange = useCallback(
    (customerErpId: string, customerName: string) => {
      setSelectedCustomerErpId(customerErpId);
      setSelectedCustomerName(customerName);
      setSelectedItem(null);
      setCopiedFromMaster(null);
      setIsDirty(false);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
    }));
    setSelectedCustomerErpId("");
    setSelectedCustomerName("");
    setCopiedFromMaster(null);
    setIsDirty(false);
  }, []);

  // -- Selection Handlers --
  const handleSelectionChanged = useCallback(
    (item: EInvoicePriceItem | null) => {
      setSelectedItem(item);
    },
    [],
  );

  const handleRowDoubleClick = useCallback((item: EInvoicePriceItem) => {
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
    async (formData: EInvoicePriceFormData) => {
      const submitData = {
        ...formData,
        customerErpId: selectedCustomerErpId || formData.customerErpId,
      };

      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      setIsFormOpen(false);
      setEditItem(null);
      setSelectedItem(null);
      setCopiedFromMaster(null);
      setIsDirty(false);
    },
    [
      editItem,
      createMutation,
      updateMutation,
      selectedCustomerErpId,
    ],
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

  // -- Master'dan musteri fiyat kopyalama --
  const handleCopyFromMaster = useCallback(() => {
    const masterData = masterQuery.data?.data ?? [];
    if (masterData.length === 0) return;

    const copied = masterData.map((item) => ({
      ...item,
      _id: `temp-${item.id}-${Date.now()}`,
      id: "",
      customerErpId: selectedCustomerErpId,
    }));

    setCopiedFromMaster(copied);
    setIsDirty(true);
  }, [masterQuery.data, selectedCustomerErpId]);

  // -- Musteri fiyat listesi kaydet --
  const handleSaveCustomerPrices = useCallback(async () => {
    if (!selectedCustomerErpId || !copiedFromMaster) return;

    const items: EInvoicePriceFormData[] = copiedFromMaster.map((item) => ({
      name: item.name,
      erpId: item.erpId,
      unitPrice: item.unitPrice,
      discountRate: item.discountRate,
      quantity: item.quantity,
      isCredit: item.isCredit,
      customerErpId: selectedCustomerErpId,
      sequence: item.sequence,
    }));

    await bulkUpsertMutation.mutateAsync(items);
    setCopiedFromMaster(null);
    setIsDirty(false);
  }, [selectedCustomerErpId, copiedFromMaster, bulkUpsertMutation]);

  // -- Musteri fiyat listesini sil --
  const handleDeleteCustomerPricesClick = useCallback(() => {
    if (!selectedCustomerErpId) return;
    setIsDeleteCustomerConfirmOpen(true);
  }, [selectedCustomerErpId]);

  const handleDeleteCustomerPricesConfirm = useCallback(async () => {
    if (!selectedCustomerErpId) return;
    await deleteCustomerMutation.mutateAsync(selectedCustomerErpId);
    setIsDeleteCustomerConfirmOpen(false);
    setCopiedFromMaster(null);
    setIsDirty(false);
    setSelectedItem(null);
  }, [selectedCustomerErpId, deleteCustomerMutation]);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    bulkUpsertMutation.isPending ||
    deleteCustomerMutation.isPending;

  // Musteriye ait kayit var mi?
  const customerHasRecords =
    selectedCustomerErpId &&
    !copiedFromMaster &&
    (customerQuery.data?.total ?? 0) > 0;

  // Musteriye ait kayit yok mu? (master'dan kopyalanabilir)
  const customerNeedsRecords =
    selectedCustomerErpId &&
    !copiedFromMaster &&
    !customerQuery.isLoading &&
    (customerQuery.data?.total ?? 0) === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            E-Fatura Fiyat Tanımları
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
            {selectedCustomerErpId
              ? `${selectedCustomerName} - Müşteri fiyat listesi`
              : "Master fiyat listesini yönetin"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Yenile */}
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

          {/* Musteri secili ve kayit yok - Master'dan kopyala */}
          {customerNeedsRecords && (
            <button
              type="button"
              onClick={handleCopyFromMaster}
              disabled={isMutating}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-warning-foreground)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-md hover:bg-[var(--color-warning)]/20 transition-colors disabled:opacity-50"
              title="Master listeden kopyala"
            >
              <Copy className="w-4 h-4" />
              <span>Master Listeden Kopyala</span>
            </button>
          )}

          {/* Kopyalanmis kayitlari kaydet */}
          {isDirty && copiedFromMaster && selectedCustomerErpId && (
            <button
              type="button"
              onClick={handleSaveCustomerPrices}
              disabled={isMutating}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-success-foreground)] bg-[var(--color-success)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Müşteri Fiyatlarını Kaydet</span>
            </button>
          )}

          {/* Musteri fiyat listesini sil */}
          {customerHasRecords && (
            <button
              type="button"
              onClick={handleDeleteCustomerPricesClick}
              disabled={isMutating}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-error)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-error)]/10 transition-colors disabled:opacity-50"
              title="Müşteri fiyat listesini sil"
            >
              <Trash className="w-4 h-4" />
              <span>Listeyi Sil</span>
            </button>
          )}

          {/* Secili kayit butonlari */}
          {selectedItem && (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
                title="Düzenle"
              >
                <Pencil className="w-4 h-4" />
                <span>Düzenle</span>
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

          {/* Yeni kayit */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kayıt</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[var(--color-border)]">
        <EInvoicePriceFilters
          search={queryParams.search || ""}
          selectedCustomerErpId={selectedCustomerErpId}
          isDirty={isDirty}
          onSearchChange={handleSearchChange}
          onCustomerChange={handleCustomerChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-[var(--color-muted-foreground)]">
            Toplam Kayıt:{" "}
            <span className="font-semibold text-[var(--color-foreground)]">
              {totalCount}
            </span>
          </span>
          <span className="text-[var(--color-muted-foreground)]">
            Mod:{" "}
            <span className="font-semibold text-[var(--color-foreground)]">
              {selectedCustomerErpId
                ? `Müşteri (${selectedCustomerName})`
                : "Master Liste"}
            </span>
          </span>
          {selectedItem && (
            <span className="text-[var(--color-muted-foreground)]">
              Seçili:{" "}
              <span className="font-semibold text-[var(--color-foreground)]">
                {selectedItem.name}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Musteri kaydi yok bilgi kartı */}
      {customerNeedsRecords && !copiedFromMaster && (
        <div className="mx-6 mt-4 p-4 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
          <p className="text-sm text-[var(--color-warning-foreground)]">
            Bu müşteri için henüz fiyat tanımı bulunmuyor. "Master Listeden
            Kopyala" butonunu kullanarak master fiyat listesini bu müşteriye
            kopyalayabilirsiniz.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <EInvoicePricesGrid
          data={displayData}
          loading={isLoading}
          onSelectionChanged={handleSelectionChanged}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>

      {/* Form Modal */}
      <EInvoicePriceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleFormSubmit}
        editItem={editItem}
        loading={isMutating}
        customerErpId={selectedCustomerErpId}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                Kaydı Sil
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                <strong>"{selectedItem?.name}"</strong> ürününü silmek
                istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
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

      {/* Delete Customer Prices Confirmation Dialog */}
      {isDeleteCustomerConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteCustomerConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                Müşteri Fiyat Listesini Sil
              </h3>
              <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-lg">
                <p className="text-sm text-[var(--color-error-foreground)]">
                  <strong>"{selectedCustomerName}"</strong> müşterisine ait
                  tüm fiyat kayıtları silinecek. Bu işlem geri alınamaz!
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteCustomerConfirmOpen(false)}
                  disabled={deleteCustomerMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCustomerPricesConfirm}
                  disabled={deleteCustomerMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-[var(--color-error-foreground)] bg-[var(--color-error)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteCustomerMutation.isPending && (
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
                  Tüm Listeyi Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
