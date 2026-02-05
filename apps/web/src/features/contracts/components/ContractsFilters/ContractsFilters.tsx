import { Search, Calendar, CalendarDays, Archive, Clock, Filter } from "lucide-react";
import type { ContractFlow, ContractCounts } from "../../types";

interface ContractsFiltersProps {
  activeFlow: ContractFlow;
  yearlyFilter: boolean | undefined;
  searchValue: string;
  counts: ContractCounts | undefined;
  onFlowChange: (flow: ContractFlow) => void;
  onYearlyChange: (yearly: boolean | undefined) => void;
  onSearchChange: (search: string) => void;
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  variant?: "default" | "success" | "warning" | "muted";
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
  variant = "default"
}: FilterButtonProps) {
  const variantClasses = {
    default: active
      ? "border-primary bg-primary/10 text-primary"
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground",
    success: active
      ? "border-success bg-success/10 text-success"
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-success/50 hover:text-success",
    warning: active
      ? "border-warning bg-warning/10 text-warning"
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-warning/50 hover:text-warning",
    muted: active
      ? "border-muted bg-muted/10 text-muted-foreground"
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground"
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${variantClasses[variant]}`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active ? "bg-white/20" : "bg-surface"
          }`}
        >
          {count.toLocaleString("tr-TR")}
        </span>
      )}
    </button>
  );
}

export function ContractsFilters({
  activeFlow,
  yearlyFilter,
  searchValue,
  counts,
  onFlowChange,
  onYearlyChange,
  onSearchChange
}: ContractsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and Flow Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Marka veya firma ara..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Flow Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            active={activeFlow === "all"}
            onClick={() => onFlowChange("all")}
            icon={<Filter className="h-4 w-4" />}
            label="Tümü"
            count={counts ? counts.active + counts.archive + counts.future : undefined}
          />
          <FilterButton
            active={activeFlow === "active"}
            onClick={() => onFlowChange("active")}
            icon={<Clock className="h-4 w-4" />}
            label="Aktif"
            count={counts?.active}
            variant="success"
          />
          <FilterButton
            active={activeFlow === "future"}
            onClick={() => onFlowChange("future")}
            icon={<Calendar className="h-4 w-4" />}
            label="Gelecek"
            count={counts?.future}
            variant="warning"
          />
          <FilterButton
            active={activeFlow === "archive"}
            onClick={() => onFlowChange("archive")}
            icon={<Archive className="h-4 w-4" />}
            label="Arşiv"
            count={counts?.archive}
            variant="muted"
          />
        </div>
      </div>

      {/* Period Filters Row */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Periyot:</span>
        <FilterButton
          active={yearlyFilter === undefined}
          onClick={() => onYearlyChange(undefined)}
          icon={<CalendarDays className="h-4 w-4" />}
          label="Tümü"
          count={counts ? counts.yearly + counts.monthly : undefined}
        />
        <FilterButton
          active={yearlyFilter === true}
          onClick={() => onYearlyChange(true)}
          icon={<Calendar className="h-4 w-4" />}
          label="Yıllık"
          count={counts?.yearly}
        />
        <FilterButton
          active={yearlyFilter === false}
          onClick={() => onYearlyChange(false)}
          icon={<CalendarDays className="h-4 w-4" />}
          label="Aylık"
          count={counts?.monthly}
        />
      </div>
    </div>
  );
}
