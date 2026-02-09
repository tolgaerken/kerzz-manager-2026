import { useState, useCallback, useMemo } from "react";
import { Plus, RefreshCw, MessageSquare } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  LicensesGrid,
  LicensesFilters,
  LicenseFormModal,
  DeleteConfirmModal,
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

export function LicensesPage() {
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

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Queries & Mutations
  const { data, isLoading, error, refetch } = useLicenses(queryParams);
  const createMutation = useCreateLicense();
  const updateMutation = useUpdateLicense();
  const deleteMutation = useDeleteLicense();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

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

  // Toolbar buttons
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    return [
      {
        id: "logs",
        label: "Loglar",
        icon: <MessageSquare className="h-4 w-4" />,
        onClick: handleOpenLogs,
        disabled: !selectedLicense
      }
    ];
  }, [selectedLicense, handleOpenLogs]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Lisanslar
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
            Yeni Lisans
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <LicensesFilters
          search={queryParams.search || ""}
          type={(queryParams.type as LicenseType) || ""}
          companyType={(queryParams.companyType as CompanyType) || ""}
          category={(queryParams.category as LicenseCategory) || ""}
          activeFilter={queryParams.active}
          blockFilter={queryParams.block}
          counts={data?.counts}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onCompanyTypeChange={handleCompanyTypeChange}
          onCategoryChange={handleCategoryChange}
          onActiveFilterChange={handleActiveFilterChange}
          onBlockFilterChange={handleBlockFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50 dark:bg-red-900/20">
          Hata: {error.message}
        </div>
      )}

      {/* Grid - Virtual scroll ile tüm veri gösteriliyor */}
      <div className="flex-1 px-6 py-4 min-h-0">
        <LicensesGrid
          data={data?.data || []}
          loading={isLoading}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
          onRowSelect={handleRowSelect}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          toolbarButtons={toolbarButtons}
        />
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
    </div>
  );
}
