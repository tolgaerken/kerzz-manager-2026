import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Queries & Mutations
  const { data, isLoading, error } = useCustomers(queryParams);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

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

  const handleCreateClick = useCallback(() => {
    setSelectedCustomer(null);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Müşteriler
        </h1>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Yeni Müşteri
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <CustomersFilters
          search={queryParams.search || ""}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50">
          Hata: {error.message}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 px-6 py-4">
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

      {/* Quick Actions - Show when hovering a row (simplified version) */}
      {selectedCustomer && !isFormModalOpen && !isDeleteModalOpen && (
        <div className="fixed bottom-20 right-6 flex gap-2">
          <button
            onClick={() => handleEditClick(selectedCustomer)}
            className="p-2 bg-[var(--color-primary)] text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
            title="Düzenle"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(selectedCustomer)}
            className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
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
