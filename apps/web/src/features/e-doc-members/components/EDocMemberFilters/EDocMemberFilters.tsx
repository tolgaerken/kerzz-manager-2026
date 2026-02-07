import { Search, X } from "lucide-react";
import {
  CONTRACT_TYPE_OPTIONS,
  INTERNAL_FIRM_OPTIONS,
} from "../../constants/eDocMembers.constants";

interface EDocMemberFiltersProps {
  search: string;
  contractType: string;
  internalFirm: string;
  active: string;
  onSearchChange: (value: string) => void;
  onContractTypeChange: (value: string) => void;
  onInternalFirmChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onClearFilters: () => void;
}

export function EDocMemberFilters({
  search,
  contractType,
  internalFirm,
  active,
  onSearchChange,
  onContractTypeChange,
  onInternalFirmChange,
  onActiveChange,
  onClearFilters,
}: EDocMemberFiltersProps) {
  const hasFilters = !!search || !!contractType || !!internalFirm || !!active;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Arama */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ERP ID, açıklama, vergi no ile ara..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Üyelik Tipi */}
      <select
        value={contractType}
        onChange={(e) => onContractTypeChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tüm Üyelik Tipleri</option>
        {CONTRACT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Firma Filtresi */}
      <select
        value={internalFirm}
        onChange={(e) => onInternalFirmChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tüm Firmalar</option>
        {INTERNAL_FIRM_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Aktiflik Filtresi */}
      <select
        value={active}
        onChange={(e) => onActiveChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tümü</option>
        <option value="true">Aktif</option>
        <option value="false">Pasif</option>
      </select>

      {/* Temizle */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="w-4 h-4" />
          Temizle
        </button>
      )}
    </div>
  );
}
