import { useState, useCallback, useMemo } from "react";
import { Plus, Pencil, Trash2, Users, RefreshCw, Receipt, FileText, Key } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  CustomersGrid,
  CustomersFilters,
  CustomerFormModal,
  DeleteConfirmModal,
  CustomerContractsModal,
  CustomerLicensesModal,
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  getCustomerErpId,
  hasCustomerErpId
} from "../features/customers";
import type {
  Customer,
  CustomerQueryParams,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../features/customers";
import { useCustomerSegmentsMinimal } from "../features/customer-segments";
import {
  AccountTransactionsModal,
  useAccountTransactionsStore
} from "../features/account-transactions";

export function CustomersPage() {
  // Query state - no pagination, fetch all data for virtual scroll
  const [queryParams, setQueryParams] = useState<CustomerQueryParams>({
    limit: 99999,
    search: "",
    sortField: "name",
    sortOrder: "asc"
  });

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [isLicensesModalOpen, setIsLicensesModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Queries & Mutations
  const { data, isLoading, error, refetch, isFetching } = useCustomers(queryParams);
  const { data: segmentsData } = useCustomerSegmentsMinimal();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  // segmentId -> segment adı eşleştirme
  const segmentMap = useMemo<Record<string, string>>(() => {
    if (!segmentsData) return {};
    return Object.fromEntries(segmentsData.map((s) => [s._id, s.name]));
  }, [segmentsData]);

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

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
        onSearchChange={(search) => setQueryParams((prev) => ({ ...prev, search }))}
        activeContractsOnly={queryParams.activeContractsOnly ?? false}
        onActiveContractsOnlyChange={(activeContractsOnly) =>
          setQueryParams((prev) => ({ ...prev, activeContractsOnly }))
        }
      />
    ),
  });

  // Handlers
  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
  }, []);

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

  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedCustomer) return;
    const resolvedErpId = getCustomerErpId(selectedCustomer);
    if (!resolvedErpId) return;
    openAccountTransactionsModal(resolvedErpId, "VERI");
  }, [selectedCustomer, openAccountTransactionsModal]);

  const handleOpenContracts = useCallback(() => {
    setIsContractsModalOpen(true);
  }, []);

  const handleOpenLicenses = useCallback(() => {
    setIsLicensesModalOpen(true);
  }, []);

  // Toolbar buttons
  const toolbarButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const hasSelection = !!selectedCustomer;
    const hasErpId = hasCustomerErpId(selectedCustomer);

    return [
      {
        id: "contracts",
        label: "Kontratlar",
        icon: <FileText className="h-4 w-4" />,
        onClick: handleOpenContracts,
        disabled: isLoading || !hasSelection
      },
      {
        id: "licenses",
        label: "Lisanslar",
        icon: <Key className="h-4 w-4" />,
        onClick: handleOpenLicenses,
        disabled: isLoading || !hasSelection
      },
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="h-4 w-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: isLoading || !hasSelection || !hasErpId
      }
    ];
  }, [selectedCustomer, isLoading, handleOpenContracts, handleOpenLicenses, handleOpenAccountTransactions]);

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
            segmentMap={segmentMap}
            selectedId={selectedCustomer?._id}
            toolbarButtons={toolbarButtons}
            onSortChange={handleSortChange}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
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

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />

      {/* Customer Contracts Modal */}
      <CustomerContractsModal
        isOpen={isContractsModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsContractsModalOpen(false)}
      />

      {/* Customer Licenses Modal */}
      <CustomerLicensesModal
        isOpen={isLicensesModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsLicensesModalOpen(false)}
      />
    </div>
  );
}
