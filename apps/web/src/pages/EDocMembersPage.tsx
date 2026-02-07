import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import {
  EDocMembersGrid,
  EDocMemberFormModal,
  EDocMemberFilters,
  CreditBalanceLegend,
  useEDocMembers,
  useCreateEDocMember,
  useUpdateEDocMember,
  useDeleteEDocMember,
  eDocMemberKeys,
} from "../features/e-doc-members";
import type {
  EDocMemberItem,
  EDocMemberQueryParams,
  EDocMemberFormData,
} from "../features/e-doc-members";

export function EDocMembersPage() {
  // -- Query State --
  const [queryParams, setQueryParams] = useState<EDocMemberQueryParams>({
    search: "",
    contractType: "",
    internalFirm: "",
    active: "",
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // -- Selection State --
  const [selectedItem, setSelectedItem] = useState<EDocMemberItem | null>(null);

  // -- Modal State --
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<EDocMemberItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // -- Queries --
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useEDocMembers(queryParams);

  // -- Refresh Handler --
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eDocMemberKeys.lists() });
  }, [queryClient]);

  // -- Mutations --
  const createMutation = useCreateEDocMember();
  const updateMutation = useUpdateEDocMember();
  const deleteMutation = useDeleteEDocMember();

  // -- Filter Handlers --
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, []);

  const handleContractTypeChange = useCallback((contractType: string) => {
    setQueryParams((prev) => ({ ...prev, contractType }));
  }, []);

  const handleInternalFirmChange = useCallback((internalFirm: string) => {
    setQueryParams((prev) => ({ ...prev, internalFirm }));
  }, []);

  const handleActiveChange = useCallback((active: string) => {
    setQueryParams((prev) => ({ ...prev, active }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      contractType: "",
      internalFirm: "",
      active: "",
    }));
  }, []);

  // -- Selection Handlers --
  const handleSelectionChanged = useCallback(
    (item: EDocMemberItem | null) => {
      setSelectedItem(item);
    },
    [],
  );

  const handleRowDoubleClick = useCallback((item: EDocMemberItem) => {
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
    async (formData: EDocMemberFormData) => {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
      setEditItem(null);
      setSelectedItem(null);
    },
    [editItem, createMutation, updateMutation],
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

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            E-Belge Üye Yönetimi
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
            E-belge üyelerini ve kontör bakiyelerini yönetin
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

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Üye</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[var(--color-border)]">
        <EDocMemberFilters
          search={queryParams.search || ""}
          contractType={queryParams.contractType || ""}
          internalFirm={queryParams.internalFirm || ""}
          active={queryParams.active || ""}
          onSearchChange={handleSearchChange}
          onContractTypeChange={handleContractTypeChange}
          onInternalFirmChange={handleInternalFirmChange}
          onActiveChange={handleActiveChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Stats Bar + Legend */}
      <div className="px-6 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-[var(--color-muted-foreground)]">
              Toplam Kayıt:{" "}
              <span className="font-semibold text-[var(--color-foreground)]">
                {data?.total ?? 0}
              </span>
            </span>
            {selectedItem && (
              <span className="text-[var(--color-muted-foreground)]">
                Seçili:{" "}
                <span className="font-semibold text-[var(--color-foreground)]">
                  {selectedItem.customerName || selectedItem.erpId}
                </span>
              </span>
            )}
          </div>
          <CreditBalanceLegend />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <EDocMembersGrid
          data={data?.data ?? []}
          loading={isLoading}
          onSelectionChanged={handleSelectionChanged}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>

      {/* Form Modal */}
      <EDocMemberFormModal
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
                Üyeyi Sil
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
                Bu e-belge üyesini silmek istediğinizden emin misiniz? Bu işlem
                geri alınamaz.
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
    </div>
  );
}
