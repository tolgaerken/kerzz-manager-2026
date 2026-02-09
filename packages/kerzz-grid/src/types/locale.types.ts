export interface GridLocale {
  // Filter labels
  filterPlaceholder: string;
  filterContains: string;
  filterEquals: string;
  filterStartsWith: string;
  filterEndsWith: string;
  filterNotContains: string;
  filterGreaterThan: string;
  filterLessThan: string;
  filterGreaterThanOrEqual: string;
  filterLessThanOrEqual: string;
  filterBetween: string;
  filterNotEqual: string;
  filterBefore: string;
  filterAfter: string;
  filterToday: string;
  filterThisWeek: string;
  filterClear: string;
  filterSelectAll: string;
  filterDeselectAll: string;
  filterShowBlanks: string;
  filterShowFilled: string;
  filterBlank: string;
  filterNotBlank: string;
  filterSearchPlaceholder: string;
  filterOk: string;
  filterCancel: string;
  filterClose: string;
  filterInvalidNumber: string;
  /** Comma-separated month names (January,...,December) */
  filterMonths: string;

  // Sort labels
  sortAscending: string;
  sortDescending: string;
  sortClear: string;

  // Column management
  columnVisibility: string;
  columnShowAll: string;
  columnHideAll: string;

  // Footer labels
  footerSum: string;
  footerAvg: string;
  footerCount: string;
  footerMin: string;
  footerMax: string;
  footerDistinctCount: string;

  // Toolbar
  toolbarExportExcel: string;
  toolbarExportPdf: string;
  toolbarColumns: string;
  toolbarSearchPlaceholder: string;
  toolbarSave: string;
  toolbarCancel: string;
  toolbarAddRow: string;

  // Active filter bar
  activeFilters: string;
  clearAllFilters: string;
  filterEnabled: string;
  filterDisabled: string;
  filterSelected: string;
  filterDaysSelected: string;

  // Settings panel
  settingsTitle: string;
  settingsSelectionMode: string;
  settingsHeaderFilters: string;
  settingsFooterAggregation: string;
  settingsResetSorting: string;
  settingsResetAll: string;
  selectionNone: string;
  selectionSingle: string;
  selectionMultiple: string;
  aggregationNone: string;
  toolbarSettings: string;

  // General
  noData: string;
  loading: string;
  items: string;
  of: string;
  and: string;
}

export type LocaleKey = keyof GridLocale;

export type SupportedLocale = 'tr' | 'en';
