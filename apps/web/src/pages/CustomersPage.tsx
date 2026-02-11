import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Users, RefreshCw } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  CustomersGrid,
  CustomersFilters,
  CustomersPagination,
  CustomerFormModal,
  DeleteConfirmModal,
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  CUSTOMERS_CONSTANTS
} from "../features/customers";
import type {
  Customer,
  CustomerQueryParams,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../features/customers";

export function CustomersPage() {
  // Query state
  const [queryParams, setQueryParams] = useState<CustomerQueryParams>({
    page: 1,
    limit: CUSTOMERS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    sortField: "name",
    sortOrder: "asc"
  });

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Queries & Mutations
  const { data, isLoading, error, refetch, isFetching } = useCustomers(queryParams);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Users className="h-5 w-5" />,
    title: "Müşteriler",
    count: data?.meta.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Müşteri
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setIsFormModalOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <CustomersFilters
        search={queryParams.search || ""}
        onSearchChange={(search) => setQueryParams((prev) => ({ ...prev, search, page: 1 }))}
      />
    ),
  });

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  }, []);

  const handleEditClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateCustomerInput | UpdateCustomerInput) => {
      if (selectedCustomer) {
        updateMutation.mutate(
          { id: selectedCustomer._id, input: formData },
          {
            onSuccess: () => {
              setIsFormModalOpen(false);
              setSelectedCustomer(null);
            }
          }
        );
      } else {
        createMutation.mutate(formData as CreateCustomerInput, {
          onSuccess: () => {
            setIsFormModalOpen(false);
          }
        });
      }
    },
    [selectedCustomer, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedCustomer(null);
        }
      });
    }
  }, [selectedCustomer, deleteMutation]);

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedCustomer(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Filters & Actions Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Error State */}
        {error && (
          <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
            <div>
              <p className="font-medium">Veri yüklenirken hata oluştu</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="ml-auto rounded-lg border border-error/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-error/20"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Grid Container */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <CustomersGrid
            data={data?.data || []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>

        {/* Pagination */}
        <CustomersPagination
          currentPage={queryParams.page || 1}
          totalPages={data?.meta.totalPages || 0}
          total={data?.meta.total || 0}
          pageSize={queryParams.limit || CUSTOMERS_CONSTANTS.DEFAULT_PAGE_SIZE}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Quick Actions - Show when hovering a row (simplified version) */}
      {selectedCustomer && !isFormModalOpen && !isDeleteModalOpen && (
        <div className="fixed bottom-20 right-6 flex gap-2">
          <button
            onClick={() => handleEditClick(selectedCustomer)}
            className="p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary-hover transition-colors"
            title="Düzenle"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(selectedCustomer)}
            className="p-2 bg-[var(--color-error)] text-[var(--color-error-foreground)] rounded-full shadow-lg hover:opacity-90 transition-opacity"
            title="Sil"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Form Modal */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        customer={selectedCustomer}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        customer={selectedCustomer}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
