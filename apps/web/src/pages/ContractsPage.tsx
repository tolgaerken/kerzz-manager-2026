import { useState, useCallback, useMemo, useEffect } from "react";
import { FileText, Plus, RefreshCw, AlertCircle } from "lucide-react";
import {
  useContracts,
  ContractsGrid,
  ContractsFilters,
  ContractsPagination,
  GridToolbar,
  ContractDetailModal,
  CONTRACTS_CONSTANTS,
  type ContractFlow,
  type ContractQueryParams,
  type Contract
} from "../features/contracts";

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ContractsPage() {
  // Filter states
  const [flow, setFlow] = useState<ContractFlow>("active");
  const [yearly, setYearly] = useState<boolean | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(CONTRACTS_CONSTANTS.DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState("no");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Detail modal states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 400);

  // Build query params
  const queryParams: ContractQueryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      flow,
      yearly,
      search: debouncedSearch || undefined,
      sortField,
      sortOrder
    }),
    [page, pageSize, flow, yearly, debouncedSearch, sortField, sortOrder]
  );

  // Fetch contracts
  const { data, isLoading, isError, error, refetch, isFetching } = useContracts(queryParams);

  // Handlers
  const handleFlowChange = useCallback((newFlow: ContractFlow) => {
    setFlow(newFlow);
    setPage(1);
  }, []);

  const handleYearlyChange = useCallback((newYearly: boolean | undefined) => {
    setYearly(newYearly);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchInput(search);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
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

  const handleInspect = useCallback(() => {
    if (selectedContract) {
      setIsModalOpen(true);
    }
  }, [selectedContract]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Kontratlar
          </h1>
          <p className="mt-1 text-muted">
            Tüm kontratlarınızı buradan görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-elevated px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Yenile
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" />
            Yeni Kontrat
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 rounded-lg border border-border bg-surface p-4">
        <ContractsFilters
          activeFlow={flow}
          yearlyFilter={yearly}
          searchValue={searchInput}
          counts={data?.counts}
          onFlowChange={handleFlowChange}
          onYearlyChange={handleYearlyChange}
          onSearchChange={handleSearchChange}
        />
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
        {/* Toolbar */}
        <GridToolbar
          selectedContract={selectedContract}
          onInspect={handleInspect}
          disabled={isLoading}
        />

        <ContractsGrid
          data={data?.data ?? []}
          loading={isLoading}
          totalRows={data?.meta.total ?? 0}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onRowDoubleClick={handleRowDoubleClick}
          onRowSelect={handleRowSelect}
        />

        {/* Pagination */}
        {data?.meta && (
          <div className="flex-shrink-0 border-t border-border bg-surface px-4 py-3">
            <ContractsPagination
              meta={data.meta}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          contract={selectedContract}
        />
      )}
    </div>
  );
}
