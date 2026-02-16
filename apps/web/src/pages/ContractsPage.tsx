import { useState, useCallback, useMemo, useRef } from "react";
import { FileText, Plus, RefreshCw, AlertCircle, Eye, Calculator, Loader2, MessageSquare, Receipt, X, Trash2 } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  useContracts,
  useCreateContract,
  useDeleteContract,
  useCheckContract,
  useBatchCheckContracts,
  ContractsGrid,
  ContractsFilters,
  ContractDetailModal,
  ContractFormModal,
  CheckContractResultModal,
  BatchProgressModal,
  FloatingProgressBar,
  DeleteContractModal,
  type ContractFlow,
  type ContractQueryParams,
  type Contract,
  type CreateContractInput,
  type CheckContractResult
} from "../features/contracts";
import { useLogPanelStore, useLastLogDatesByContexts } from "../features/manager-log";
import { useCustomerLookup } from "../features/lookup";
import { AccountTransactionsModal, useAccountTransactionsStore } from "../features/account-transactions";

export function ContractsPage() {
  // Filter states
  const [flow, setFlow] = useState<ContractFlow>("active");
  const [yearly, setYearly] = useState<boolean | undefined>(false);
  const [sortField, setSortField] = useState("no");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Detail modal states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Check contract modal state
  const [isCheckResultOpen, setIsCheckResultOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckContractResult | null>(null);
  const beforeContractRef = useRef<Contract | null>(null);

  // Build query params - no pagination, fetch all data for virtual scroll
  // yearly filtresi frontend'de uygulanacak (periyot sayıları için)
  const queryParams: ContractQueryParams = useMemo(
    () => ({
      flow,
      sortField,
      sortOrder
    }),
    [flow, sortField, sortOrder]
  );

  // Fetch contracts
  const { data: rawData, isLoading, isError, error, refetch, isFetching } = useContracts(queryParams);

  // Frontend'de flow/yearly filtreleme ve sayıları hesaplama
  const { filteredData, periodCounts } = useMemo(() => {
    if (!rawData?.data) {
      return { filteredData: [], periodCounts: { yearly: 0, monthly: 0 } };
    }

    // Aktif kontratlarda ücretsiz olanları gösterme
    const allData =
      flow === "active"
        ? rawData.data.filter((contract) => !contract.isFree)
        : rawData.data;
    const yearlyCount = allData.filter((c) => c.yearly).length;
    const monthlyCount = allData.filter((c) => !c.yearly).length;

    // yearly filtresi undefined ise tüm veriyi göster
    const periodFiltered = yearly === undefined
      ? allData
      : allData.filter((c) => c.yearly === yearly);

    return {
      filteredData: periodFiltered,
      periodCounts: { yearly: yearlyCount, monthly: monthlyCount }
    };
  }, [rawData?.data, yearly, flow]);

  // data objesini oluştur (eski yapıyla uyumlu)
  const data = useMemo(() => {
    if (!rawData) return undefined;
    return {
      ...rawData,
      data: filteredData
    };
  }, [rawData, filteredData]);

  // Delete contract modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Create contract mutation
  const createMutation = useCreateContract();

  // Delete contract mutation
  const deleteMutation = useDeleteContract();

  // Check contract mutation
  const checkMutation = useCheckContract();

  // Batch check contracts hook
  const batchCheck = useBatchCheckContracts();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Customer lookup for erpId
  const { customerMap } = useCustomerLookup();

  // Contract ID'lerini topla (son log tarihleri için)
  const {
    contractIds,
    legacyContractNumbers,
    customerIds,
    contractNumberToContractIdMap,
    customerIdToContractIdMap,
  } = useMemo(() => {
    const contracts = data?.data ?? [];

    // contractNumber -> contractId mapping (legacy sonuçlarını dönüştürmek için)
    const numberToIdMap = new Map<string, string>();
    // customerId -> contractId mapping (legacy customerId sonuçlarını dönüştürmek için)
    const customerToContractMap = new Map<string, string>();

    for (const c of contracts) {
      if (c.no && c.no > 0 && c._id) {
        numberToIdMap.set(String(c.no), c._id);
      }
      // Her customerId için en son contractId'yi sakla
      if (c.customerId && c._id) {
        customerToContractMap.set(c.customerId, c._id);
      }
    }

    return {
      contractIds: [...new Set(contracts.map((c) => c._id).filter(Boolean))],
      // Legacy log sisteminde contractId olarak contractNumber (no) kullanılıyor
      legacyContractNumbers: [
        ...new Set(
          contracts
            .map((c) => c.no)
            .filter((n) => n && n > 0)
            .map((n) => String(n))
        ),
      ],
      // Legacy log sisteminde customerId ile de log tutulmuş olabilir
      customerIds: [...new Set(contracts.map((c) => c.customerId).filter(Boolean))],
      contractNumberToContractIdMap: numberToIdMap,
      customerIdToContractIdMap: customerToContractMap,
    };
  }, [data?.data]);

  // Son log tarihlerini batch olarak getir (yeni + legacy)
  const { data: rawLastLogDates } = useLastLogDatesByContexts({
    contexts: [
      { type: "contract", ids: contractIds },
    ],
    // Legacy için hem contractNumber hem customerId gönder
    legacyContractIds: legacyContractNumbers,
    legacyCustomerIds: customerIds,
    includeLegacy: true,
    groupByField: "contractId",
  });

  // Legacy sonuçlarını contractId'ye dönüştür
  const lastLogDatesByContractId = useMemo(() => {
    if (!rawLastLogDates) return undefined;
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(rawLastLogDates)) {
      // 1. Eğer key bir contractNumber ise, contractId'ye dönüştür
      const contractIdFromNumber = contractNumberToContractIdMap.get(key);
      if (contractIdFromNumber) {
        if (!result[contractIdFromNumber] || value > result[contractIdFromNumber]) {
          result[contractIdFromNumber] = value;
        }
      }

      // 2. Eğer key bir customerId ise, ilgili contractId'ye dönüştür
      const contractIdFromCustomer = customerIdToContractIdMap.get(key);
      if (contractIdFromCustomer) {
        if (!result[contractIdFromCustomer] || value > result[contractIdFromCustomer]) {
          result[contractIdFromCustomer] = value;
        }
      }

      // 3. Orijinal key'i de koru (yeni log sistemi için)
      if (!result[key] || value > result[key]) {
        result[key] = value;
      }
    }

    return result;
  }, [rawLastLogDates, contractNumberToContractIdMap, customerIdToContractIdMap]);

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileText className="h-5 w-5" />,
    title: "Kontrat Yönetimi",
    count: data?.data?.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          onClick={() => refetch({ cancelRefetch: true })}
          disabled={isFetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Kontrat
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch({ cancelRefetch: true })}
          disabled={isFetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni
        </button>
      </div>
    ),
    children: (
      <ContractsFilters
        activeFlow={flow}
        yearlyFilter={yearly}
        counts={data?.counts}
        periodCounts={periodCounts}
        onFlowChange={setFlow}
        onYearlyChange={setYearly}
      />
    ),
  });

  // Handlers
  const handleSortChange = useCallback((field: string, order: "asc" | "desc") => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const handleRowDoubleClick = useCallback((contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  }, []);

  const handleRowSelect = useCallback((contract: Contract | null) => {
    setSelectedContract(contract);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    // Son seçilen kontratı selectedContract olarak ayarla
    if (ids.length > 0 && data?.data) {
      const lastSelectedId = ids[ids.length - 1];
      const contract = data.data.find((c) => c._id === lastSelectedId);
      if (contract) {
        setSelectedContract(contract);
      }
    } else if (ids.length === 0) {
      setSelectedContract(null);
    }
  }, [data?.data]);

  const handleInspect = useCallback(() => {
    if (selectedContract) {
      setIsModalOpen(true);
    }
  }, [selectedContract]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleContractUpdated = useCallback((updatedContract: Contract) => {
    setSelectedContract(updatedContract);
  }, []);

  const handleFormModalClose = useCallback(() => {
    setIsFormModalOpen(false);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CreateContractInput) => {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsFormModalOpen(false);
        }
      });
    },
    [createMutation]
  );

  const handleCheckContract = useCallback(() => {
    if (!selectedContract) return;

    // Onceki kontrat durumunu kaydet
    beforeContractRef.current = { ...selectedContract };

    checkMutation.mutate(selectedContract.id, {
      onSuccess: (result) => {
        setCheckResult(result);
        // Kontratin guncel halini almak icin listeyi yenile
        refetch().then((res) => {
          // Guncel kontrati bul ve selectedContract'i guncelle
          const updatedContract = res.data?.data.find(
            (c) => c.id === selectedContract.id
          );
          if (updatedContract) {
            setSelectedContract(updatedContract);
          }
          setIsCheckResultOpen(true);
        });
      }
    });
  }, [selectedContract, checkMutation, refetch]);

  const handleCheckResultClose = useCallback(() => {
    setIsCheckResultOpen(false);
    setCheckResult(null);
    beforeContractRef.current = null;
  }, []);

  // Batch check handlers
  const handleCheckMultipleContracts = useCallback(() => {
    if (selectedIds.length === 0 || !data?.data) return;

    const selectedContracts = data.data.filter((c) => selectedIds.includes(c._id));
    if (selectedContracts.length > 0) {
      batchCheck.startBatchCheck(selectedContracts);
    }
  }, [selectedIds, data?.data, batchCheck]);

  const handleBatchMinimize = useCallback(() => {
    batchCheck.minimizeBatchCheck();
  }, [batchCheck]);

  const handleBatchMaximize = useCallback(() => {
    batchCheck.maximizeBatchCheck();
  }, [batchCheck]);

  const handleBatchPause = useCallback(() => {
    batchCheck.pauseBatchCheck();
  }, [batchCheck]);

  const handleBatchResume = useCallback(() => {
    batchCheck.resumeBatchCheck();
  }, [batchCheck]);

  const handleBatchCancel = useCallback(() => {
    batchCheck.cancelBatchCheck();
  }, [batchCheck]);

  const handleBatchClose = useCallback(() => {
    batchCheck.clearBatchCheck();
    // Refresh data after batch completion
    refetch();
  }, [batchCheck, refetch]);

  // Log panelini aç (toolbar butonu için)
  const handleOpenLogs = useCallback(() => {
    if (!selectedContract) return;
    openEntityPanel({
      customerId: selectedContract.customerId,
      activeTab: "contract",
      contractId: selectedContract._id,
      title: `Kontrat: ${selectedContract.brand || selectedContract.company || `#${selectedContract.no}`}`,
    });
  }, [selectedContract, openEntityPanel]);

  // Log panelini aç (grid satırındaki ikon için)
  const handleOpenLogsForContract = useCallback(
    (contract: Contract) => {
      openEntityPanel({
        customerId: contract.customerId,
        activeTab: "contract",
        contractId: contract._id,
        title: `Kontrat: ${contract.brand || contract.company || `#${contract.no}`}`,
      });
    },
    [openEntityPanel]
  );

  // Cari hareketleri modalını aç
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedContract) return;
    const customer = customerMap.get(selectedContract.customerId);
    if (!customer?.erpId) return;
    openAccountTransactionsModal(customer.erpId, selectedContract.internalFirm || "VERI");
  }, [selectedContract, customerMap, openAccountTransactionsModal]);

  // Kontrat silme
  const handleDeleteContract = useCallback(() => {
    if (!selectedContract) return;
    setIsDeleteModalOpen(true);
  }, [selectedContract]);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedContract) return;
    deleteMutation.mutate(selectedContract._id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedContract(null);
        setSelectedIds([]);
      }
    });
  }, [selectedContract, deleteMutation]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  // Toolbar buttons for kerzz-grid
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    const hasSelection = selectedIds.length > 0 || selectedContract;
    const isMultipleSelected = selectedIds.length > 1;
    const isProcessing = checkMutation.isPending || batchCheck.progress?.status === "running";

    // Check if selected contract has erpId
    const hasErpId = selectedContract
      ? !!customerMap.get(selectedContract.customerId)?.erpId
      : false;

    const handleCheckClick = () => {
      if (isMultipleSelected) {
        handleCheckMultipleContracts();
      } else {
        handleCheckContract();
      }
    };

    const getCheckButtonLabel = () => {
      if (isProcessing) return "Hesaplanıyor...";
      if (isMultipleSelected) return `Ödeme Planı Hesapla (${selectedIds.length})`;
      return "Ödeme Planı Hesapla";
    };

    return [
      {
        id: "inspect",
        label: "İncele",
        icon: <Eye className="h-4 w-4" />,
        onClick: handleInspect,
        disabled: isLoading || !hasSelection || isMultipleSelected
      },
      {
        id: "logs",
        label: "Loglar",
        icon: <MessageSquare className="h-4 w-4" />,
        onClick: handleOpenLogs,
        disabled: isLoading || !hasSelection || isMultipleSelected
      },
      {
        id: "account-transactions",
        label: "Cari Hareketleri",
        icon: <Receipt className="h-4 w-4" />,
        onClick: handleOpenAccountTransactions,
        disabled: isLoading || !hasSelection || isMultipleSelected || !hasErpId
      },
      {
        id: "check-payment",
        label: getCheckButtonLabel(),
        icon: isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />,
        onClick: handleCheckClick,
        disabled: isLoading || !hasSelection || isProcessing
      },
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDeleteContract,
        disabled: isLoading || !hasSelection || isMultipleSelected || deleteMutation.isPending,
        variant: "danger"
      }
    ];
  }, [
    selectedIds.length,
    selectedContract,
    checkMutation.isPending,
    batchCheck.progress?.status,
    isLoading,
    customerMap,
    deleteMutation.isPending,
    handleInspect,
    handleOpenLogs,
    handleOpenAccountTransactions,
    handleCheckContract,
    handleCheckMultipleContracts,
    handleDeleteContract
  ]);

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
        {isError && (
          <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Veri yüklenirken hata oluştu</p>
              <p className="text-sm opacity-80">
                {error instanceof Error ? error.message : "Bilinmeyen hata"}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="ml-auto rounded-lg border border-error/30 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-error/20"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Grid Container - Flex grow to fill remaining space */}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <ContractsGrid
            data={data?.data ?? []}
            loading={isLoading}
            yearlyFilter={yearly}
            onSortChange={handleSortChange}
            onRowDoubleClick={handleRowDoubleClick}
            onRowSelect={handleRowSelect}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            toolbarButtons={toolbarButtons}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
            lastLogDatesByContractId={lastLogDatesByContractId}
            onOpenLogs={handleOpenLogsForContract}
          />
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          contract={selectedContract}
          onContractUpdated={handleContractUpdated}
        />
      )}

      {/* Contract Form Modal */}
      <ContractFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending}
      />

      {/* Check Contract Result Modal */}
      {selectedContract && checkResult && beforeContractRef.current && (
        <CheckContractResultModal
          isOpen={isCheckResultOpen}
          onClose={handleCheckResultClose}
          contract={selectedContract}
          beforeContract={beforeContractRef.current}
          result={checkResult}
        />
      )}

      {/* Check Contract Error Notification */}
      {checkMutation.isError && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 flex items-start gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 md:p-4 shadow-lg">
          <AlertCircle className="h-5 w-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--color-error-foreground)]">Hesaplama hatası</p>
            <p className="text-sm text-[var(--color-error)] truncate">
              {checkMutation.error instanceof Error
                ? checkMutation.error.message
                : "Ödeme planı hesaplanırken bir hata oluştu"}
            </p>
          </div>
          <button
            onClick={() => checkMutation.reset()}
            className="flex-shrink-0 rounded-md p-1.5 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Batch Progress Modal (full screen) */}
      {batchCheck.progress && !batchCheck.progress.isMinimized && (
        <BatchProgressModal
          progress={batchCheck.progress}
          onMinimize={handleBatchMinimize}
          onPause={handleBatchPause}
          onResume={handleBatchResume}
          onCancel={handleBatchCancel}
          onClose={handleBatchClose}
        />
      )}

      {/* Floating Progress Bar (minimized) */}
      {batchCheck.progress && batchCheck.progress.isMinimized && (
        <FloatingProgressBar
          progress={batchCheck.progress}
          onMaximize={handleBatchMaximize}
          onPause={handleBatchPause}
          onResume={handleBatchResume}
          onCancel={handleBatchCancel}
          onClose={handleBatchClose}
        />
      )}

      {/* Delete Contract Confirm Modal */}
      {selectedContract && (
        <DeleteContractModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleDeleteConfirm}
          contract={selectedContract}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
