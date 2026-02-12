import { useState, useCallback, useMemo } from "react";
import { Plus, RefreshCw, MessageSquare, Receipt, Key } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  LicensesGrid,
  LicensesFilters,
  LicenseFormModal,
  DeleteConfirmModal,
  LicenseSearchInput,
  useLicenses,
  useCreateLicense,
  useUpdateLicense,
  useDeleteLicense
} from "../features/licenses";
import type {
  License,
  LicenseQueryParams,
  LicenseType,
  CompanyType,
  LicenseCategory,
  CreateLicenseInput,
  UpdateLicenseInput
} from "../features/licenses";
import { useLogPanelStore } from "../features/manager-log";
import { useCustomerLookup } from "../features/lookup";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

export function LicensesPage() {
  // Mobile detection
  const isMobile = useIsMobile();

  // Query state - tüm veriyi getirmek için limit yüksek tutuldu (virtual scroll kullanılacak)
  const [queryParams, setQueryParams] = useState<LicenseQueryParams>({
    limit: 100000,
    search: "",
    type: "",
    companyType: "",
    category: "",
    sortField: "licenseId",
    sortOrder: "desc"
  });

  // Mobile search state (frontend filtering)
  const [mobileSearch, setMobileSearch] = useState("");

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Queries & Mutations
  const { data: rawData, isLoading, isFetching, refetch } = useLicenses(queryParams);
  const createMutation = useCreateLicense();
  const updateMutation = useUpdateLicense();
  const deleteMutation = useDeleteLicense();

  // Frontend'de mobil arama filtreleme
  const data = useMemo(() => {
    if (!rawData?.data) return rawData;

    const normalizedSearch = mobileSearch.trim().toLocaleLowerCase("tr-TR");
    if (!isMobile || normalizedSearch.length === 0) {
      return rawData;
    }

    const filteredData = rawData.data.filter((license) => {
      const licenseId = String(license.licenseId).toLocaleLowerCase("tr-TR");
      const brandName = (license.brandName || "").toLocaleLowerCase("tr-TR");
      const customerName = (license.customerName || "").toLocaleLowerCase("tr-TR");
      const phone = (license.phone || "").toLocaleLowerCase("tr-TR");

      return (
        licenseId.includes(normalizedSearch) ||
        brandName.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch)
      );
    });

    return {
      ...rawData,
      data: filteredData
    };
  }, [rawData, isMobile, mobileSearch]);

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Customer lookup for erpId
  const { customerMap } = useCustomerLookup();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, []);

  const handleTypeChange = useCallback((type: LicenseType | "") => {
    setQueryParams((prev) => ({ ...prev, type }));
  }, []);

  const handleCompanyTypeChange = useCallback((companyType: CompanyType | "") => {
    setQueryParams((prev) => ({ ...prev, companyType }));
  }, []);

  const handleCategoryChange = useCallback((category: LicenseCategory | "") => {
    setQueryParams((prev) => ({ ...prev, category }));
  }, []);

  const handleActiveFilterChange = useCallback((active: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, active }));
  }, []);

  const handleBlockFilterChange = useCallback((block: boolean | undefined) => {
    setQueryParams((prev) => ({ ...prev, block }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      type: "",
      companyType: "",
      category: "",
      active: undefined,
      block: undefined
    }));
  }, []);

  const handleSortChange = useCallback(
    (sortField: string, sortOrder: "asc" | "desc") => {
      setQueryParams((prev) => ({ ...prev, sortField, sortOrder }));
    },
    []
  );

  const handleRowDoubleClick = useCallback((license: License) => {
    setSelectedLicense(license);
    setIsFormModalOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedLicense(null);
    setIsFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateLicenseInput | UpdateLicenseInput) => {
      if (selectedLicense) {
        updateMutation.mutate(
          { id: selectedLicense._id, data: formData },
          {
            onSuccess: () => {
              setIsFormModalOpen(false);
              setSelectedLicense(null);
            }
          }
        );
      } else {
        createMutation.mutate(formData as CreateLicenseInput, {
          onSuccess: () => {
            setIsFormModalOpen(false);
          }
        });
      }
    },
    [selectedLicense, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selectedLicense) {
      deleteMutation.mutate(selectedLicense._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedLicense(null);
        }
      });
    }
  }, [selectedLicense, deleteMutation]);

  const handleFormClose = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedLicense(null);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedLicense(null);
  }, []);

  // Row click handler
  const handleRowSelect = useCallback((license: License | null) => {
    setSelectedLicense(license);
  }, []);

  // Selection change handler (multi-select)
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    // Son seçilen lisansı selectedLicense olarak ayarla
    if (ids.length > 0 && data?.data) {
      const lastSelectedId = ids[ids.length - 1];
      const license = data.data.find((l) => l._id === lastSelectedId);
      if (license) {
        setSelectedLicense(license);
      }
    } else if (ids.length === 0) {
      setSelectedLicense(null);
    }
  }, [data?.data]);

  // Log panelini aç
  const handleOpenLogs = useCallback(() => {
    if (!selectedLicense) return;
    openEntityPanel({
      customerId: selectedLicense.customerId,
      activeTab: "license",
      licenseId: selectedLicense._id,
      title: `Lisans: ${selectedLicense.brandName || `#${selectedLicense.licenseId}`}`,
    });
  }, [selectedLicense, openEntityPanel]);

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedLicense) return;
    const customer = customerMap.get(selectedLicense.customerId);
    if (!customer?.erpId) return;
    // License'da internalFirm yok, varsayılan VERI kullan
    openAccountTransactionsModal(customer.erpId, "VERI");
  }, [selectedLicense, customerMap, openAccountTransactionsModal]);

  // Toolbar buttons
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    // Check if selected license has erpId via customer
    const hasErpId = selectedLicense
      ? !!customerMap.get(selectedLicense.customerId)?.erpId
      : false;

    return [
      {
        id: "logs",
        label: "Loglar",
        icon: <MessageSquare className="h-4 w-4" />,
        onClick: handleOpenLogs,
        disabled: !selectedLicense
      },
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="h-4 w-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: !selectedLicense || !hasErpId
      }
    ];
  }, [selectedLicense, customerMap, handleOpenLogs, handleOpenAccountTransactions]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Key className="h-5 w-5" />,
    title: "Lisanslar",
    count: data?.data?.length,
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
          Yeni Lisans
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
      <>
        <LicensesFilters
          search={queryParams.search || ""}
          type={(queryParams.type as LicenseType) || ""}
          companyType={(queryParams.companyType as CompanyType) || ""}
          category={(queryParams.category as LicenseCategory) || ""}
          activeFilter={queryParams.active}
          blockFilter={queryParams.block}
          counts={rawData?.counts}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onCompanyTypeChange={handleCompanyTypeChange}
          onCategoryChange={handleCategoryChange}
          onActiveFilterChange={handleActiveFilterChange}
          onBlockFilterChange={handleBlockFilterChange}
          onClearFilters={handleClearFilters}
          hideMobileSearch={true}
        />
        {isMobile && (
          <LicenseSearchInput value={mobileSearch} onChange={setMobileSearch} />
        )}
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
          <LicensesGrid
            data={data?.data || []}
            loading={isLoading}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onRowSelect={handleRowSelect}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            toolbarButtons={toolbarButtons}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
          />
        </div>
      </div>

      {/* Form Modal */}
      <LicenseFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormClose}
        license={selectedLicense}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title="Lisans Silme Onayı"
        message={`"${selectedLicense?.brandName}" lisansını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
