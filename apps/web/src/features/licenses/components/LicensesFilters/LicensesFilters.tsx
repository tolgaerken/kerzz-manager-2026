import { Search, Filter, X } from "lucide-react";
import { LICENSE_TYPES, COMPANY_TYPES, LICENSE_CATEGORIES } from "../../constants/licenses.constants";
import type { LicenseType, CompanyType, LicenseCategory, LicenseCounts } from "../../types";

interface LicensesFiltersProps {
  search: string;
  type: LicenseType | "";
  companyType: CompanyType | "";
  category: LicenseCategory | "";
  activeFilter: boolean | undefined;
  blockFilter: boolean | undefined;
  counts?: LicenseCounts;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: LicenseType | "") => void;
  onCompanyTypeChange: (value: CompanyType | "") => void;
  onCategoryChange: (value: LicenseCategory | "") => void;
  onActiveFilterChange: (value: boolean | undefined) => void;
  onBlockFilterChange: (value: boolean | undefined) => void;
  onClearFilters: () => void;
}

export function LicensesFilters({
  search,
  type,
  companyType,
  category,
  activeFilter,
  blockFilter,
  counts,
  onSearchChange,
  onTypeChange,
  onCompanyTypeChange,
  onCategoryChange,
  onActiveFilterChange,
  onBlockFilterChange,
  onClearFilters
}: LicensesFiltersProps) {
  const hasActiveFilters =
    search || type || companyType || category || activeFilter !== undefined || blockFilter !== undefined;

  return (
    <div className="space-y-4">
      {/* Üst satır - Arama ve temizle */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
          <input
            type="text"
            placeholder="Lisans ara (tabela, müşteri, telefon, ID...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Filtre temizle butonu */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Alt satır - Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-foreground-muted)]" />

        {/* Tip filtresi */}
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as LicenseType | "")}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Tipler</option>
          {LICENSE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {counts?.byType && `(${counts.byType[t.id === "kerzz-pos" ? "kerzzPos" : t.id === "orwi-pos" ? "orwiPos" : "kerzzCloud"]})`}
            </option>
          ))}
        </select>

        {/* Şirket tipi filtresi */}
        <select
          value={companyType}
          onChange={(e) => onCompanyTypeChange(e.target.value as CompanyType | "")}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Şirket Tipleri</option>
          {COMPANY_TYPES.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name} {counts?.byCompanyType && `(${counts.byCompanyType[ct.id as keyof typeof counts.byCompanyType]})`}
            </option>
          ))}
        </select>

        {/* Kategori filtresi */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as LicenseCategory | "")}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Kategoriler</option>
          {LICENSE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Aktif filtresi */}
        <select
          value={activeFilter === undefined ? "" : activeFilter.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onActiveFilterChange(val === "" ? undefined : val === "true");
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Aktif Durumu</option>
          <option value="true">Aktif {counts && `(${counts.active})`}</option>
          <option value="false">Pasif</option>
        </select>

        {/* Bloke filtresi */}
        <select
          value={blockFilter === undefined ? "" : blockFilter.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onBlockFilterChange(val === "" ? undefined : val === "true");
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Bloke Durumu</option>
          <option value="true">Blokeli {counts && `(${counts.blocked})`}</option>
          <option value="false">Blokesiz</option>
        </select>

        {/* İstatistikler */}
        {counts && (
          <div className="ml-auto flex items-center gap-4 text-sm text-[var(--color-foreground-muted)]">
            <span>
              Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
            </span>
            <span>
              Kontratlı: <strong className="text-green-500">{counts.withContract}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
