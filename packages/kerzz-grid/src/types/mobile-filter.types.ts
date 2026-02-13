/**
 * Mobile Filter/Sort Types
 * Mobil card view'lar icin filter ve sort tip tanimlari
 */

// ── Filter Conditions ──

/** Filtre koşul tipleri */
export type MobileFilterCondition =
  | 'contains'      // içerir
  | 'notContains'   // içermez
  | 'equals'        // eşittir
  | 'notEquals'     // eşit değil
  | 'startsWith'    // ile başlar
  | 'endsWith'      // ile biter
  | 'greaterThan'   // büyüktür
  | 'lessThan'      // küçüktür
  | 'greaterOrEqual'// büyük eşit
  | 'lessOrEqual'   // küçük eşit
  | 'between'       // arasında
  | 'blank'         // boş
  | 'notBlank';     // dolu

// ── Column Config Types ──

/** Mobil filtre sutun konfigurasyonu */
export interface MobileFilterColumnConfig {
  /** Sutun ID'si (GridColumnDef.id ile ayni) */
  id: string;
  /** Gosterilecek baslik */
  header: string;
  /** Veri tipi */
  type: 'text' | 'number' | 'boolean' | 'select';
  /** Accessor key (data'dan deger okumak icin) */
  accessorKey: string;
  /** Select tipi için seçenekler (opsiyonel - data'dan otomatik hesaplanır) */
  options?: { value: string; label: string }[];
}

/** Mobil siralama sutun konfigurasyonu */
export interface MobileSortColumnConfig {
  /** Sutun ID'si */
  id: string;
  /** Gosterilecek baslik */
  header: string;
  /** Accessor key (data'dan deger okumak icin) */
  accessorKey: string;
}

// ── Active Filter ──

/** Aktif filtre */
export interface MobileActiveFilter {
  /** Sutun ID */
  columnId: string;
  /** Koşul */
  condition: MobileFilterCondition;
  /** Değer (blank/notBlank için undefined) */
  value?: string | number | boolean;
  /** İkinci değer (between için) */
  valueTo?: string | number;
}

/** Tum filtrelerin state'i */
export interface MobileFilterState {
  [columnId: string]: MobileActiveFilter;
}

// ── Sort Types ──

/** Siralama state'i */
export interface MobileSortState {
  /** Siralanan sutun ID'si (null = siralama yok) */
  columnId: string | null;
  /** Siralama yonu */
  direction: 'asc' | 'desc';
}

// ── Dropdown Options ──

/** Dropdown filtre secenegi */
export interface MobileDropdownOption {
  /** Deger */
  value: string;
  /** Gosterilecek etiket */
  label: string;
  /** Bu degere sahip kayit sayisi */
  count: number;
}

// ── Hook Types ──

/** useMobileFilterSort hook opsiyonlari */
export interface UseMobileFilterSortOptions<TData> {
  /** Filtrelenecek data */
  data: TData[];
  /** Filtre sutun konfigurasyonlari */
  filterColumns: MobileFilterColumnConfig[];
  /** Siralama sutun konfigurasyonlari */
  sortColumns: MobileSortColumnConfig[];
  /** Dil (varsayilan: 'tr') */
  locale?: 'tr' | 'en';
}

/** useMobileFilterSort hook donus degeri */
export interface UseMobileFilterSortReturn<TData> {
  /** Filtrelenmis ve siralanmis data */
  filteredData: TData[];
  /** Mevcut filtre state'i */
  filterState: MobileFilterState;
  /** Mevcut siralama state'i */
  sortState: MobileSortState;
  /** Aktif filtre sayisi */
  activeFilterCount: number;
  /** Siralama ozet etiketi (ornek: "Tutara gore (azalan)") */
  sortLabel: string | null;
  /** Filtre ekle/güncelle */
  setFilter: (filter: MobileActiveFilter) => void;
  /** Filtre kaldir */
  removeFilter: (columnId: string) => void;
  /** Tum filtreleri temizle */
  clearAllFilters: () => void;
  /** Siralama ayarla */
  setSort: (columnId: string | null, direction: 'asc' | 'desc') => void;
  /** Sıralamayı kaldır */
  clearSort: () => void;
  /** Select tipi filtreler icin unique degerler (count ile) */
  getSelectOptions: (columnId: string) => MobileDropdownOption[];
}

// ── Component Props Types ──

/** MobileFilterSort komponenti props */
export interface MobileFilterSortProps<TData> {
  /** Filtrelenecek data */
  data: TData[];
  /** Filtre sutun konfigurasyonlari */
  filterColumns: MobileFilterColumnConfig[];
  /** Siralama sutun konfigurasyonlari */
  sortColumns: MobileSortColumnConfig[];
  /** Dil (varsayilan: 'tr') */
  locale?: 'tr' | 'en';
  /** Filtrelenmis data callback */
  onFilteredDataChange: (data: TData[]) => void;
  /** Varsayilan acik/kapali (varsayilan: false) */
  defaultExpanded?: boolean;
  /** CSS class */
  className?: string;
}

// ── Deprecated types (backward compatibility) ──

/** @deprecated Use MobileActiveFilter instead */
export interface MobileDropdownFilterValue {
  selectedValues: Set<string>;
  blanksMode: 'blank' | 'filled' | null;
}

/** @deprecated Use MobileActiveFilter instead */
export interface MobileTextFilterValue {
  text: string;
  blanksMode: 'blank' | 'filled' | null;
}

/** @deprecated Use MobileActiveFilter instead */
export interface MobileBooleanFilterValue {
  value: boolean | null;
}

/** @deprecated Use MobileActiveFilter instead */
export interface MobileNumericFilterValue {
  min?: number;
  max?: number;
}

/** @deprecated Use MobileActiveFilter instead */
export type MobileFilterValue =
  | { type: 'dropdown'; value: MobileDropdownFilterValue }
  | { type: 'text'; value: MobileTextFilterValue }
  | { type: 'boolean'; value: MobileBooleanFilterValue }
  | { type: 'numeric'; value: MobileNumericFilterValue };
