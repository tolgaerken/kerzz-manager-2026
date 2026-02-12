import { Search, Filter, X } from "lucide-react";
import { useIsMobile } from "../../../../hooks/useIsMobile";
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
  /** Mobilde arama gizlensin mi? (LicensesPage'de ayrı arama input'u var) */
  hideMobileSearch?: boolean;
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
  onClearFilters,
  hideMobileSearch = false
}: LicensesFiltersProps) {
  const isMobile = useIsMobile();
  const hasActiveFilters =
    search || type || companyType || category || activeFilter !== undefined || blockFilter !== undefined;

  // Select için ortak class
  const selectClass = isMobile
    ? "w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
    : "px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Üst satır - Arama ve temizle (desktop) */}
      {(!isMobile || !hideMobileSearch) && (
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
            <input
              type="text"
              placeholder={isMobile ? "Lisans ara..." : "Lisans ara (tabela, müşteri, telefon, ID...)"}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>

          {/* Filtre temizle butonu */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors md:justify-start"
            >
              <X className="w-4 h-4" />
              <span className="hidden md:inline">Filtreleri Temizle</span>
              <span className="md:hidden">Temizle</span>
            </button>
          )}
        </div>
      )}

      {/* Alt satır - Filtreler */}
      <div className={`flex ${isMobile ? "flex-col gap-2" : "flex-wrap items-center gap-3"}`}>
        {/* Filter icon - sadece desktop */}
        {!isMobile && <Filter className="w-4 h-4 text-[var(--color-foreground-muted)]" />}

        {/* Mobilde 2'li grid, desktop'ta inline */}
        <div className={isMobile ? "grid grid-cols-2 gap-2" : "contents"}>
          {/* Tip filtresi */}
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as LicenseType | "")}
            className={selectClass}
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
            className={selectClass}
          >
            <option value="">{isMobile ? "Şirket Tipi" : "Tüm Şirket Tipleri"}</option>
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
            className={selectClass}
          >
            <option value="">{isMobile ? "Kategori" : "Tüm Kategoriler"}</option>
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
            className={selectClass}
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
            className={selectClass}
          >
            <option value="">Bloke Durumu</option>
            <option value="true">Blokeli {counts && `(${counts.blocked})`}</option>
            <option value="false">Blokesiz</option>
          </select>

          {/* Mobilde filtre temizle butonu (arama gizliyse) */}
          {isMobile && hideMobileSearch && hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors border border-[var(--color-border)] rounded-md"
            >
              <X className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>

        {/* İstatistikler - sadece desktop */}
        {!isMobile && counts && (
          <div className="ml-auto flex items-center gap-4 text-sm text-[var(--color-foreground-muted)]">
            <span>
              Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
            </span>
            <span>
              Kontratlı: <strong className="text-[var(--color-success)]">{counts.withContract}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Mobil istatistikler - compact */}
      {isMobile && counts && (
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-foreground-muted)] pt-1">
          <span>
            Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
          </span>
          <span>
            Kontratlı: <strong className="text-[var(--color-success)]">{counts.withContract}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
