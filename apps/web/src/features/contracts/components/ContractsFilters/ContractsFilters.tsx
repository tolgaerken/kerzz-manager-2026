import { Calendar, CalendarDays, Archive, Clock, Gift } from "lucide-react";
import type { ContractFlow, ContractCounts } from "../../types";

interface PeriodCounts {
  yearly: number;
  monthly: number;
}

interface ContractsFiltersProps {
  activeFlow: ContractFlow;
  yearlyFilter: boolean | undefined;
  counts: ContractCounts | undefined;
  periodCounts: PeriodCounts;
  onFlowChange: (flow: ContractFlow) => void;
  onYearlyChange: (yearly: boolean | undefined) => void;
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  variant?: "default" | "success" | "warning" | "muted" | "info";
  className?: string;
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
  count,
  variant = "default",
  className = ""
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
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground",
    info: active
      ? "border-info bg-info/10 text-info"
      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-info/50 hover:text-info"
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${variantClasses[variant]} ${className}`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
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
  counts,
  periodCounts,
  onFlowChange,
  onYearlyChange
}: ContractsFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-4">
      {/* Flow Filters */}
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:items-center md:gap-1.5">
        <FilterButton
          active={activeFlow === "active"}
          onClick={() => onFlowChange("active")}
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Aktif"
          count={counts?.active}
          variant="success"
          className="w-full md:w-auto"
        />
        <FilterButton
          active={activeFlow === "free"}
          onClick={() => onFlowChange("free")}
          icon={<Gift className="h-3.5 w-3.5" />}
          label="Ücretsiz"
          count={counts?.free}
          variant="info"
          className="w-full md:w-auto"
        />
        <FilterButton
          active={activeFlow === "future"}
          onClick={() => onFlowChange("future")}
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Gelecek"
          count={counts?.future}
          variant="warning"
          className="w-full md:w-auto"
        />
        <FilterButton
          active={activeFlow === "archive"}
          onClick={() => onFlowChange("archive")}
          icon={<Archive className="h-3.5 w-3.5" />}
          label="Arşiv"
          count={counts?.archive}
          variant="muted"
          className="w-full md:w-auto"
        />
      </div>

      {/* Divider - hidden on mobile */}
      <div className="hidden md:block h-6 w-px bg-border-subtle" />

      {/* Period Filters */}
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:items-center md:gap-1.5">
        <span className="hidden md:inline text-xs text-muted-foreground mr-1">Periyot:</span>
        <FilterButton
          active={yearlyFilter === true}
          onClick={() => onYearlyChange(true)}
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Yıllık"
          count={periodCounts.yearly}
          className="w-full md:w-auto"
        />
        <FilterButton
          active={yearlyFilter === false}
          onClick={() => onYearlyChange(false)}
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Aylık"
          count={periodCounts.monthly}
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
