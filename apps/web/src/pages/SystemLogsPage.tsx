import { useState, useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
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

  // Detail modal state
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Query
  const { data, isLoading, error, refetch } = useSystemLogs(queryParams);

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Sistem Logları
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <SystemLogsStats stats={data?.stats} />
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
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
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 text-red-600 bg-red-50 dark:bg-red-900/20">
          Hata: {error.message}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 px-6 py-4 min-h-0">
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

      {/* Detail Modal */}
      <SystemLogDetailModal
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        log={selectedLog}
      />
    </div>
  );
}
