import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  InflationRateFormModal,
  InflationRatesGrid,
  useCreateInflationRate,
  useDeleteInflationRate,
  useInflationRates,
  useUpdateInflationRate,
  inflationRateKeys,
} from "../features/inflation-rates";
import type {
  InflationRateFormData,
  InflationRateItem,
  InflationRateQueryParams,
} from "../features/inflation-rates";
import { useQueryClient } from "@tanstack/react-query";

export function InflationRatesPage() {
  const [queryParams, setQueryParams] = useState<InflationRateQueryParams>({
    search: "",
    sortField: "date",
    sortOrder: "desc",
  });
  const [selectedItem, setSelectedItem] = useState<InflationRateItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<InflationRateItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useInflationRates(queryParams);
  const createMutation = useCreateInflationRate();
  const updateMutation = useUpdateInflationRate();
  const deleteMutation = useDeleteInflationRate();

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: inflationRateKeys.lists() });
  }, [queryClient]);

  const handleAdd = useCallback(() => {
    setEditItem(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedItem) return;
    setEditItem(selectedItem);
    setIsFormOpen(true);
  }, [selectedItem]);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;
    setIsDeleteConfirmOpen(true);
  }, [selectedItem]);

  const handleFormSubmit = useCallback(
    async (formData: InflationRateFormData) => {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      setIsFormOpen(false);
      setEditItem(null);
      setSelectedItem(null);
    },
    [createMutation, editItem, updateMutation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;
    await deleteMutation.mutateAsync(selectedItem.id);
    setIsDeleteConfirmOpen(false);
    setSelectedItem(null);
  }, [deleteMutation, selectedItem]);

  const statsText = useMemo(() => {
    const total = data?.total ?? 0;
    return `${total} kayıt`;
  }, [data?.total]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Enflasyon Oranları
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">{statsText}</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ara..."
            value={queryParams.search || ""}
            onChange={(e) =>
              setQueryParams((prev) => ({ ...prev, search: e.target.value || undefined }))
            }
            className="w-52 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2"
            title="Yenile"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading || isRefetching ? "animate-spin" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
          >
            <Plus className="h-4 w-4" />
            Yeni
          </button>

          <button
            type="button"
            onClick={handleEdit}
            disabled={!selectedItem}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm disabled:opacity-50"
          >
            <Pencil className="h-4 w-4" />
            Düzenle
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedItem}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-error)] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <InflationRatesGrid
          data={data?.data || []}
          loading={isLoading}
          selectedItem={selectedItem}
          onSelectionChanged={setSelectedItem}
          onRowDoubleClick={(item) => {
            setEditItem(item);
            setIsFormOpen(true);
          }}
        />
      </div>

      <InflationRateFormModal
        isOpen={isFormOpen}
        loading={isMutating}
        editItem={editItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
              Kaydı Sil
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              Seçili enflasyon kaydını silmek istediğine emin misin?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deleteMutation.isPending}
                className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-[var(--color-error)] px-3 py-2 text-sm font-medium text-[var(--color-error-foreground)]"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
