import { useState, useCallback, useMemo, useRef } from "react";
import { FileText, Plus, RefreshCw, AlertCircle, Eye, Calculator, Loader2, MessageSquare } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import {
  useContracts,
  useCreateContract,
  useCheckContract,
  useBatchCheckContracts,
  ContractsGrid,
  ContractsFilters,
  ContractDetailModal,
  ContractFormModal,
  CheckContractResultModal,
  BatchProgressModal,
  FloatingProgressBar,
  type ContractFlow,
  type ContractQueryParams,
  type Contract,
  type CreateContractInput,
  type CheckContractResult
} from "../features/contracts";
import { useLogPanelStore } from "../features/manager-log";

export function ContractsPage() {
  // Filter states
  const [flow, setFlow] = useState<ContractFlow>("active");
  const [yearly, setYearly] = useState<boolean | undefined>(false);
  const [sortField, setSortField] = useState("no");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  // Frontend'de yearly filtreleme ve sayıları hesaplama
  const { filteredData, periodCounts } = useMemo(() => {
    if (!rawData?.data) {
      return { filteredData: [], periodCounts: { yearly: 0, monthly: 0 } };
    }

    const allData = rawData.data;
    const yearlyCount = allData.filter((c) => c.yearly).length;
    const monthlyCount = allData.filter((c) => !c.yearly).length;

    // yearly filtresi undefined ise tüm veriyi göster
    const filtered = yearly === undefined 
      ? allData 
      : allData.filter((c) => c.yearly === yearly);

    return {
      filteredData: filtered,
      periodCounts: { yearly: yearlyCount, monthly: monthlyCount }
    };
  }, [rawData?.data, yearly]);

  // data objesini oluştur (eski yapıyla uyumlu)
  const data = useMemo(() => {
    if (!rawData) return undefined;
    return {
      ...rawData,
      data: filteredData
    };
  }, [rawData, filteredData]);

  // Create contract mutation
  const createMutation = useCreateContract();

  // Check contract mutation
  const checkMutation = useCheckContract();

  // Batch check contracts hook
  const batchCheck = useBatchCheckContracts();

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Handlers
  const handleFlowChange = useCallback((newFlow: ContractFlow) => {
    setFlow(newFlow);
  }, []);

  const handleYearlyChange = useCallback((newYearly: boolean | undefined) => {
    setYearly(newYearly);
  }, []);

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

  const handleCreateClick = useCallback(() => {
    setIsFormModalOpen(true);
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

  // Log panelini aç
  const handleOpenLogs = useCallback(() => {
    if (!selectedContract) return;
    openEntityPanel({
      customerId: selectedContract.customerId,
      activeTab: "contract",
      contractId: selectedContract._id,
      title: `Kontrat: ${selectedContract.brand || selectedContract.company || `#${selectedContract.no}`}`,
    });
  }, [selectedContract, openEntityPanel]);

  // Toolbar buttons for kerzz-grid
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(() => {
    const hasSelection = selectedIds.length > 0 || selectedContract;
    const isMultipleSelected = selectedIds.length > 1;
    const isProcessing = checkMutation.isPending || batchCheck.progress?.status === "running";

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
        id: "check-payment",
        label: getCheckButtonLabel(),
        icon: isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />,
        onClick: handleCheckClick,
        disabled: isLoading || !hasSelection || isProcessing
      }
    ];
  }, [
    selectedIds.length,
    selectedContract,
    checkMutation.isPending,
    batchCheck.progress?.status,
    isLoading,
    handleInspect,
    handleOpenLogs,
    handleCheckContract,
    handleCheckMultipleContracts
  ]);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Filters & Actions Container */}
      <div className="flex-shrink-0 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-4">
          {/* Header Row - Title & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">Kontrat Yönetimi</h1>
              {data?.data && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {data.data.length} kontrat
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch({ cancelRefetch: true })}
                disabled={isFetching}
                className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Yenile
              </button>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Yeni Kontrat
              </button>
            </div>
          </div>

          {/* Filters */}
          <ContractsFilters
            activeFlow={flow}
            yearlyFilter={yearly}
            counts={data?.counts}
            periodCounts={periodCounts}
            onFlowChange={handleFlowChange}
            onYearlyChange={handleYearlyChange}
          />
        </div>
      </div>

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
        />
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
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-50 p-4 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Hesaplama hatası</p>
            <p className="text-sm text-red-600">
              {checkMutation.error instanceof Error
                ? checkMutation.error.message
                : "Ödeme planı hesaplanırken bir hata oluştu"}
            </p>
          </div>
          <button
            onClick={() => checkMutation.reset()}
            className="ml-2 rounded-md p-1 text-red-600 hover:bg-red-100 transition-colors"
          >
            &times;
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
    </div>
  );
}
