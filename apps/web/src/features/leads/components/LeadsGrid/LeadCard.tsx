import { memo } from "react";
import { Calendar, Building2, Phone, Mail, ChevronRight, DollarSign } from "lucide-react";
import type { Lead, LeadStatus, LeadPriority } from "../../types/lead.types";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

// Date formatter
function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// Currency formatter
function formatCurrency(value: number | undefined, currency?: string): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Status badge component
function StatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<LeadStatus, { label: string; className: string }> = {
    new: {
      label: "Yeni",
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
    },
    contacted: {
      label: "İletişime Geçildi",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
    },
    qualified: {
      label: "Nitelikli",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
    },
    unqualified: {
      label: "Niteliksiz",
      className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
    },
    converted: {
      label: "Dönüştürüldü",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
    },
    lost: {
      label: "Kaybedildi",
      className: "bg-[var(--color-error)]/10 text-[var(--color-error)]"
    }
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: LeadPriority }) {
  const config: Record<LeadPriority, { label: string; className: string }> = {
    low: {
      label: "Düşük",
      className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
    },
    medium: {
      label: "Orta",
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
    },
    high: {
      label: "Yüksek",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
    },
    urgent: {
      label: "Acil",
      className: "bg-[var(--color-error)]/10 text-[var(--color-error)]"
    }
  };

  const { label, className } = config[priority] ?? {
    label: priority,
    className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}

export const LeadCard = memo(function LeadCard({
  lead,
  onClick
}: LeadCardProps) {
  const handleClick = () => {
    onClick(lead);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]"
    >
      {/* Header: Ref, Status, Priority */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
              #{lead.pipelineRef?.slice(-6) || "-"}
            </span>
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {lead.contactName || "-"}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-1" />
      </div>

      {/* Company */}
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{lead.companyName || "-"}</span>
      </div>

      {/* Contact Info */}
      <div className="mb-2 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
        {lead.contactPhone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{lead.contactPhone}</span>
          </div>
        )}
        {lead.contactEmail && (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{lead.contactEmail}</span>
          </div>
        )}
      </div>

      {/* Footer: Value & Expected Close Date */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div>
          <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Tahmini Değer</span>
          <p className="flex items-center gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            <DollarSign className="h-3.5 w-3.5" />
            {formatCurrency(lead.estimatedValue, lead.currency)}
          </p>
        </div>
        {lead.expectedCloseDate && (
          <div className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(lead.expectedCloseDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
});
