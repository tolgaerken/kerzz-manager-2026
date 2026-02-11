import { useState, useCallback } from "react";
import { Plus, RefreshCw, Cpu } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<HardwareProduct | null>(null);

  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useHardwareProducts(queryParams);
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

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Cpu className="h-5 w-5" />,
    title: "Donanım Ürünleri",
    count: data?.pagination?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Ürün
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={handleCreateClick}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <HardwareProductsFilters
        search={queryParams.search || ""}
        saleActiveFilter={queryParams.saleActive}
        counts={data?.counts}
        onSearchChange={handleSearchChange}
        onSaleActiveFilterChange={handleSaleActiveFilterChange}
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

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
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
      </div>

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
