import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Plus, Pencil, Trash2, FileCheck } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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

  // -- Collapsible Section State --
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

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

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileCheck className="h-5 w-5" />,
    title: "E-Belge Üye Yönetimi",
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
          Yeni Üye
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
        {/* Stats Bar + Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
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
                  {selectedItem.customerName || selectedItem.erpId}
                </span>
              </span>
            )}
          </div>
          <CreditBalanceLegend />
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
          <EDocMembersGrid
            data={data?.data ?? []}
            loading={isLoading}
            onSelectionChanged={handleSelectionChanged}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
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
          <div className="relative z-10 w-full max-w-md mx-4 bg-surface border border-border rounded-md shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Üyeyi Sil
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Bu e-belge üyesini silmek istediğinizden emin misiniz? Bu işlem
                geri alınamaz.
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
    </div>
  );
}
