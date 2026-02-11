import { useState, useCallback } from "react";
import { Plus, RefreshCw, Package } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
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

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SoftwareProduct | null>(null);

  // Queries & Mutations
  const { data, isLoading, isFetching, refetch } = useSoftwareProducts(queryParams);
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

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Package className="h-5 w-5" />,
    title: "Yazılım Ürünleri",
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
      </div>

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
