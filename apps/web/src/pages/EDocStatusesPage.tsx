import { useState, useCallback, useMemo } from "react";
import { FileCheck, RefreshCw, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "../hooks/useIsMobile";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import {
  EDocStatusesGrid,
  DateRangeFilter,
  useIntegratorStatuses,
  useDatePreset,
  eDocStatusKeys,
} from "../features/e-doc-statuses";

export function EDocStatusesPage() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Date range state
  const {
    startDate,
    endDate,
    activePreset,
    handlePresetChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useDatePreset("today");

  // Collapsible section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Mobile search state
  const [mobileSearch, setMobileSearch] = useState("");

  // Query
  const { data, isLoading, isRefetching } = useIntegratorStatuses({
    startDate,
    endDate,
  });

  // Refresh handler
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: eDocStatusKeys.lists() });
  }, [queryClient]);

  // Mobile search filtering
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!isMobile || !mobileSearch.trim()) return data;

    const normalizedSearch = mobileSearch.trim().toLocaleLowerCase("tr-TR");
    return data.filter((item) => {
      const name = item.taxpayerName.toLocaleLowerCase("tr-TR");
      const vkn = item.taxpayerVknTckn.toLocaleLowerCase("tr-TR");
      return name.includes(normalizedSearch) || vkn.includes(normalizedSearch);
    });
  }, [data, isMobile, mobileSearch]);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <FileCheck className="h-5 w-5" />,
    title: "E-Belge Durumları",
    count: filteredData.length,
    expanded: isFiltersExpanded,
    onExpandedChange: setIsFiltersExpanded,
    desktopActions: (
      <>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`}
          />
          Yenile
        </button>
      </>
    ),
    mobileActions: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading || isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    ),
    children: (
      <>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          activePreset={activePreset}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onPresetChange={handlePresetChange}
        />
        {/* Mobile search */}
        {isMobile && (
          <div className="mt-3 relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <input
              type="text"
              placeholder="Mükellef adı veya VKN ara..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>
        )}
        {/* Stats bar */}
        <div className="mt-3 flex items-center gap-6 text-sm">
          <span className="text-[var(--color-muted-foreground)]">
            Toplam Kayıt:{" "}
            <span className="font-semibold text-[var(--color-foreground)]">
              {filteredData.length}
            </span>
          </span>
        </div>
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
          <EDocStatusesGrid
            data={filteredData}
            loading={isLoading}
            onScrollDirectionChange={collapsible.handleScrollDirectionChange}
          />
        </div>
      </div>
    </div>
  );
}
