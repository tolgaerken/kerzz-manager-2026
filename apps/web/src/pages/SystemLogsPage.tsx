import { useState, useCallback, useMemo } from "react";
import { RefreshCw, ScrollText } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  SystemLogsFilters,
  SystemLogsGrid,
  SystemLogDetailModal,
  SystemLogsStats,
  SystemLogsPagination,
  useSystemLogs,
  SYSTEM_LOGS_CONSTANTS,
} from "../features/system-logs";
import type {
  SystemLog,
  SystemLogQueryParams,
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "../features/system-logs";

export function SystemLogsPage() {
  // Query state
  const [queryParams, setQueryParams] = useState<SystemLogQueryParams>({
    page: 1,
    limit: SYSTEM_LOGS_CONSTANTS.DEFAULT_PAGE_SIZE,
    search: "",
    category: "",
    action: "",
    status: "",
    module: "",
    startDate: "",
    endDate: "",
    sortField: "createdAt",
    sortOrder: "desc",
  });

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Detail modal state
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Query
  const { data, isLoading, isFetching, refetch } = useSystemLogs(queryParams);

  // Modül listesini stats'tan çıkar
  const availableModules = useMemo(() => {
    if (!data?.stats?.byModule) return [];
    return Object.keys(data.stats.byModule).sort();
  }, [data?.stats?.byModule]);

  // Handlers
  const handleSearchChange = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((category: SystemLogCategory | "") => {
    setQueryParams((prev) => ({ ...prev, category, action: "", page: 1 }));
  }, []);

  const handleActionChange = useCallback((action: SystemLogAction | "") => {
    setQueryParams((prev) => ({ ...prev, action, page: 1 }));
  }, []);

  const handleStatusChange = useCallback((status: SystemLogStatus | "") => {
    setQueryParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleModuleChange = useCallback((module: string) => {
    setQueryParams((prev) => ({ ...prev, module, page: 1 }));
  }, []);

  const handleStartDateChange = useCallback((startDate: string) => {
    setQueryParams((prev) => ({ ...prev, startDate, page: 1 }));
  }, []);

  const handleEndDateChange = useCallback((endDate: string) => {
    setQueryParams((prev) => ({ ...prev, endDate, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: "",
      category: "",
      action: "",
      status: "",
      module: "",
      startDate: "",
      endDate: "",
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleRowClick = useCallback((log: SystemLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  }, []);

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedLog(null);
  }, []);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <ScrollText className="h-5 w-5" />,
    title: "Sistem Logları",
    count: data?.pagination?.total,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <button
        onClick={() => refetch()}
        disabled={isLoading || isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
        Yenile
      </button>
    ),
    mobileActions: (
      <button
        onClick={() => refetch()}
        disabled={isLoading || isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetching ? "animate-spin" : ""}`} />
      </button>
    ),
    children: (
      <>
        {/* Stats */}
        <div className="mb-4">
          <SystemLogsStats stats={data?.stats} />
        </div>
        {/* Filters */}
        <SystemLogsFilters
          search={queryParams.search || ""}
          category={(queryParams.category as SystemLogCategory) || ""}
          action={(queryParams.action as SystemLogAction) || ""}
          status={(queryParams.status as SystemLogStatus) || ""}
          module={queryParams.module || ""}
          startDate={queryParams.startDate || ""}
          endDate={queryParams.endDate || ""}
          modules={availableModules}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onActionChange={handleActionChange}
          onStatusChange={handleStatusChange}
          onModuleChange={handleModuleChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onClearFilters={handleClearFilters}
        />
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
          <SystemLogsGrid
            data={data?.data || []}
            loading={isLoading}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <SystemLogsPagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>

      {/* Detail Modal */}
      <SystemLogDetailModal
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        log={selectedLog}
      />
    </div>
  );
}
