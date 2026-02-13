import { memo } from "react";
import {
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  Ban,
  FileCheck
} from "lucide-react";
import type { License, LicenseType, CompanyType } from "../../types";

interface LicenseCardProps {
  license: License;
  onClick: () => void;
  selected?: boolean;
}

// Date formatter - relative time for lastOnline
function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "Bilinmiyor";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
}

// License type badge config
const LICENSE_TYPE_CONFIG: Record<LicenseType, { label: string; className: string }> = {
  "kerzz-pos": {
    label: "KP",
    className: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
  },
  "orwi-pos": {
    label: "OP",
    className: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
  },
  "kerzz-cloud": {
    label: "KC",
    className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
  }
};

// Company type badge config
const COMPANY_TYPE_CONFIG: Record<CompanyType, { label: string }> = {
  chain: { label: "Zincir" },
  single: { label: "Tekil" },
  belediye: { label: "Belediye" },
  unv: { label: "Üniversite" }
};

// Type badge component
function TypeBadge({ type }: { type: LicenseType }) {
  const config = LICENSE_TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

// Status badge component
function StatusBadge({ active, block }: { active: boolean; block: boolean }) {
  if (block) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-error)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-error)]">
        <Ban className="h-3 w-3" />
        Blokeli
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
        <CheckCircle2 className="h-3 w-3" />
        Aktif
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-muted-foreground)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)]">
      <XCircle className="h-3 w-3" />
      Pasif
    </span>
  );
}

export const LicenseCard = memo(function LicenseCard({
  license,
  onClick,
  selected = false
}: LicenseCardProps) {
  const companyTypeLabel = COMPANY_TYPE_CONFIG[license.companyType]?.label || license.companyType;
  const cityName = license.address?.city || "-";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative rounded-lg border p-2.5 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98] ${
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      {/* Header: ID, Brand, Type Badge */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">#{license.licenseId}</span>
            <TypeBadge type={license.type} />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {license.brandName || "-"}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-1" />
      </div>

      {/* Customer Name */}
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{license.customerName || "-"}</span>
        {companyTypeLabel && (
          <span className="ml-auto text-[10px] text-[var(--color-muted-foreground)]">
            ({companyTypeLabel})
          </span>
        )}
      </div>

      {/* City */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{cityName}</span>
      </div>

      {/* Footer: Last Online, Contract Status, Active Status */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-muted-foreground)]">
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(license.lastOnline)}</span>
        </div>
        <div className="flex items-center gap-2">
          {license.haveContract && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-success)]">
              <FileCheck className="h-3 w-3" />
            </span>
          )}
          <StatusBadge active={license.active} block={license.block} />
        </div>
      </div>
    </div>
  );
});
