import { useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import {
  HardwareProductsGrid,
  HardwareProductsFilters,
  HardwareProductsPagination,
  HardwareProductFormModal,
  DeleteConfirmModal,
  useHardwareProducts,
  useCreateHardwareProduct,
  useUpdateHardwareProduct,
  useDeleteHardwareProduct,
  HARDWARE_PRODUCTS_CONSTANTS
} from "../features/hardware-products";
import type {
  HardwareProduct,
  HardwareProductQueryParams,
  CreateHardwareProductInput,
  UpdateHardwareProductInput
} from "../features/hardware-products";

export function HardwareProductsPage() {
  // Query state
  const [queryParams, setQueryParams] = useState<HardwareProductQueryParams>({
    page: 1,
    limit: HARDWARE_PRODUCTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    sortField: "name",
    sortOrder: "asc"
  });

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<HardwareProduct | null>(null);

  // Queries & Mutations
  const { data, isLoading, error, refetch } = useHardwareProducts(queryParams);
  const createMutation = useCreateHardwareProduct();
  const updateMutation = useUpdateHardwareProduct();
  const deleteMutation = useDeleteHardwareProduct();

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleSaleActiveFilterChange = useCallback((saleActive: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, saleActive, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      saleActive: undefined,
      page: 1
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((product: HardwareProduct) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateHardwareProductInput | UpdateHardwareProductInput) => {
      if (selectedProduct) {
        updateMutation.mutate(
          { id: selectedProduct._id, data: formData },
          {
            onSuccess: () => {
              setIsFormModalOpen(false);
              setSelectedProduct(null);
            }
          }
        );
      } else {
        createMutation.mutate(formData as CreateHardwareProductInput, {
          onSuccess: () => {
            setIsFormModalOpen(false);
          }
        });
      }
    },
    [selectedProduct, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }
      });
    }
  }, [selectedProduct, deleteMutation]);

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Donanım Ürünleri
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <HardwareProductsFilters
          search={queryParams.search || ""}
          saleActiveFilter={queryParams.saleActive}
          counts={data?.counts}
          onSearchChange={handleSearchChange}
          onSaleActiveFilterChange={handleSaleActiveFilterChange}
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
        <HardwareProductsGrid
          data={data?.data || []}
          loading={isLoading}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <HardwareProductsPagination
          pagination={data.pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Form Modal */}
      <HardwareProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title="Ürün Silme Onayı"
        message={`"${selectedProduct?.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
