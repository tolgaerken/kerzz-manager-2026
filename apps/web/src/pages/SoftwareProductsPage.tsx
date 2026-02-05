import { useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import {
  SoftwareProductsGrid,
  SoftwareProductsFilters,
  SoftwareProductsPagination,
  SoftwareProductFormModal,
  DeleteConfirmModal,
  useSoftwareProducts,
  useCreateSoftwareProduct,
  useUpdateSoftwareProduct,
  useDeleteSoftwareProduct,
  SOFTWARE_PRODUCTS_CONSTANTS
} from "../features/software-products";
import type {
  SoftwareProduct,
  SoftwareProductQueryParams,
  CreateSoftwareProductInput,
  UpdateSoftwareProductInput
} from "../features/software-products";

export function SoftwareProductsPage() {
  // Query state
  const [queryParams, setQueryParams] = useState<SoftwareProductQueryParams>({
    page: 1,
    limit: SOFTWARE_PRODUCTS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    type: "",
    sortField: "name",
    sortOrder: "asc"
  });

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SoftwareProduct | null>(null);

  // Queries & Mutations
  const { data, isLoading, error, refetch } = useSoftwareProducts(queryParams);
  const createMutation = useCreateSoftwareProduct();
  const updateMutation = useUpdateSoftwareProduct();
  const deleteMutation = useDeleteSoftwareProduct();

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleSaleActiveFilterChange = useCallback((saleActive: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, saleActive, page: 1 }));
  }, []);

  const handleIsSaasFilterChange = useCallback((isSaas: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, isSaas, page: 1 }));
  }, []);

  const handleTypeFilterChange = useCallback((type: string) => {
    setQueryParams((prev) => ({ ...prev, type, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      saleActive: undefined,
      isSaas: undefined,
      type: "",
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

  const handleRowDoubleClick = useCallback((product: SoftwareProduct) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateSoftwareProductInput | UpdateSoftwareProductInput) => {
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
        createMutation.mutate(formData as CreateSoftwareProductInput, {
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
          Yazılım Ürünleri
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
        <SoftwareProductsFilters
          search={queryParams.search || ""}
          saleActiveFilter={queryParams.saleActive}
          isSaasFilter={queryParams.isSaas}
          typeFilter={queryParams.type || ""}
          counts={data?.counts}
          onSearchChange={handleSearchChange}
          onSaleActiveFilterChange={handleSaleActiveFilterChange}
          onIsSaasFilterChange={handleIsSaasFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
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
        <SoftwareProductsGrid
          data={data?.data || []}
          loading={isLoading}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <SoftwareProductsPagination
          pagination={data.pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Form Modal */}
      <SoftwareProductFormModal
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
