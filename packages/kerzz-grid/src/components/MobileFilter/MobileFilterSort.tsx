import { memo, useState, useCallback, useEffect } from 'react';
import { useMobileFilterSort } from '../../core/useMobileFilterSort';
import type {
  MobileFilterSortProps,
  MobileFilterColumnConfig,
  MobileActiveFilter,
  MobileFilterCondition,
  MobileDropdownOption,
} from '../../types/mobile-filter.types';

// ── i18n ──

const LOCALE_LABELS = {
  tr: {
    filters: 'Filtreler',
    sort: 'Sıralama',
    activeFilters: 'filtre',
    noSort: 'Sıralama yok',
    noFilters: 'Filtre yok',
    addFilter: 'Filtre Ekle',
    addSort: 'Sıralama Ekle',
    clearAll: 'Temizle',
    ascending: 'Artan',
    descending: 'Azalan',
    cancel: 'İptal',
    apply: 'Uygula',
    selectField: 'Alan Seç',
    selectCondition: 'Koşul Seç',
    enterValue: 'Değer girin',
    selectValue: 'Değer seçin',
    // Conditions
    contains: 'İçerir',
    notContains: 'İçermez',
    equals: 'Eşittir',
    notEquals: 'Eşit Değil',
    startsWith: 'İle Başlar',
    endsWith: 'İle Biter',
    greaterThan: 'Büyüktür',
    lessThan: 'Küçüktür',
    greaterOrEqual: 'Büyük Eşit',
    lessOrEqual: 'Küçük Eşit',
    between: 'Arasında',
    blank: 'Boş',
    notBlank: 'Dolu',
    yes: 'Evet',
    no: 'Hayır',
    and: 've',
  },
  en: {
    filters: 'Filters',
    sort: 'Sort',
    activeFilters: 'filters',
    noSort: 'No sorting',
    noFilters: 'No filters',
    addFilter: 'Add Filter',
    addSort: 'Add Sort',
    clearAll: 'Clear',
    ascending: 'Ascending',
    descending: 'Descending',
    cancel: 'Cancel',
    apply: 'Apply',
    selectField: 'Select Field',
    selectCondition: 'Select Condition',
    enterValue: 'Enter value',
    selectValue: 'Select value',
    contains: 'Contains',
    notContains: 'Not Contains',
    equals: 'Equals',
    notEquals: 'Not Equals',
    startsWith: 'Starts With',
    endsWith: 'Ends With',
    greaterThan: 'Greater Than',
    lessThan: 'Less Than',
    greaterOrEqual: 'Greater or Equal',
    lessOrEqual: 'Less or Equal',
    between: 'Between',
    blank: 'Blank',
    notBlank: 'Not Blank',
    yes: 'Yes',
    no: 'No',
    and: 'and',
  },
} as const;

type LocaleLabels = Record<string, string>;
type LocaleKey = keyof typeof LOCALE_LABELS.tr;

// ── Condition Config ──

interface ConditionConfig {
  id: MobileFilterCondition;
  labelKey: LocaleKey;
  needsValue: boolean;
  needsSecondValue?: boolean;
}

const TEXT_CONDITIONS: ConditionConfig[] = [
  { id: 'contains', labelKey: 'contains', needsValue: true },
  { id: 'notContains', labelKey: 'notContains', needsValue: true },
  { id: 'equals', labelKey: 'equals', needsValue: true },
  { id: 'notEquals', labelKey: 'notEquals', needsValue: true },
  { id: 'startsWith', labelKey: 'startsWith', needsValue: true },
  { id: 'endsWith', labelKey: 'endsWith', needsValue: true },
  { id: 'blank', labelKey: 'blank', needsValue: false },
  { id: 'notBlank', labelKey: 'notBlank', needsValue: false },
];

const NUMBER_CONDITIONS: ConditionConfig[] = [
  { id: 'equals', labelKey: 'equals', needsValue: true },
  { id: 'notEquals', labelKey: 'notEquals', needsValue: true },
  { id: 'greaterThan', labelKey: 'greaterThan', needsValue: true },
  { id: 'lessThan', labelKey: 'lessThan', needsValue: true },
  { id: 'greaterOrEqual', labelKey: 'greaterOrEqual', needsValue: true },
  { id: 'lessOrEqual', labelKey: 'lessOrEqual', needsValue: true },
  { id: 'between', labelKey: 'between', needsValue: true, needsSecondValue: true },
  { id: 'blank', labelKey: 'blank', needsValue: false },
  { id: 'notBlank', labelKey: 'notBlank', needsValue: false },
];

const BOOLEAN_CONDITIONS: ConditionConfig[] = [
  { id: 'equals', labelKey: 'equals', needsValue: true },
  { id: 'blank', labelKey: 'blank', needsValue: false },
  { id: 'notBlank', labelKey: 'notBlank', needsValue: false },
];

const SELECT_CONDITIONS: ConditionConfig[] = [
  { id: 'equals', labelKey: 'equals', needsValue: true },
  { id: 'notEquals', labelKey: 'notEquals', needsValue: true },
  { id: 'blank', labelKey: 'blank', needsValue: false },
  { id: 'notBlank', labelKey: 'notBlank', needsValue: false },
];

function getConditionsForType(type: MobileFilterColumnConfig['type']): ConditionConfig[] {
  switch (type) {
    case 'text': return TEXT_CONDITIONS;
    case 'number': return NUMBER_CONDITIONS;
    case 'boolean': return BOOLEAN_CONDITIONS;
    case 'select': return SELECT_CONDITIONS;
    default: return TEXT_CONDITIONS;
  }
}

// ── Icons ──

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Filter Chip Component ──

interface FilterChipProps {
  filter: MobileActiveFilter;
  column: MobileFilterColumnConfig;
  labels: LocaleLabels;
  onRemove: () => void;
}

function FilterChip({ filter, column, labels, onRemove }: FilterChipProps) {
  const conditionLabel = labels[filter.condition as LocaleKey] || filter.condition;
  
  let valueDisplay = '';
  if (filter.condition !== 'blank' && filter.condition !== 'notBlank') {
    if (filter.condition === 'between') {
      valueDisplay = `: ${filter.value} - ${filter.valueTo}`;
    } else if (typeof filter.value === 'boolean') {
      valueDisplay = `: ${filter.value ? labels.yes : labels.no}`;
    } else {
      valueDisplay = `: ${filter.value}`;
    }
  }

  return (
    <div className="kerzz-mfs-chip">
      <span className="kerzz-mfs-chip-text">
        <strong>{column.header}</strong> {conditionLabel}{valueDisplay}
      </span>
      <button type="button" className="kerzz-mfs-chip-remove" onClick={onRemove}>
        <XIcon />
      </button>
    </div>
  );
}

// ── Sort Chip Component ──

interface SortChipProps {
  columnHeader: string;
  direction: 'asc' | 'desc';
  labels: LocaleLabels;
  onRemove: () => void;
}

function SortChip({ columnHeader, direction, labels, onRemove }: SortChipProps) {
  const dirLabel = direction === 'asc' ? labels.ascending : labels.descending;
  return (
    <div className="kerzz-mfs-chip sort">
      <ArrowUpDownIcon className="kerzz-mfs-chip-icon" />
      <span className="kerzz-mfs-chip-text">
        {columnHeader} ({dirLabel})
      </span>
      <button type="button" className="kerzz-mfs-chip-remove" onClick={onRemove}>
        <XIcon />
      </button>
    </div>
  );
}

// ── Add Filter Popup ──

interface AddFilterPopupProps {
  filterColumns: MobileFilterColumnConfig[];
  existingFilters: string[];
  labels: LocaleLabels;
  getSelectOptions: (columnId: string) => MobileDropdownOption[];
  onAdd: (filter: MobileActiveFilter) => void;
  onClose: () => void;
}

function AddFilterPopup({ filterColumns, existingFilters, labels, getSelectOptions, onAdd, onClose }: AddFilterPopupProps) {
  const [selectedColumn, setSelectedColumn] = useState<MobileFilterColumnConfig | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ConditionConfig | null>(null);
  const [value, setValue] = useState<string>('');
  const [valueTo, setValueTo] = useState<string>('');

  // Henüz filtre eklenmemiş kolonlar
  const availableColumns = filterColumns.filter(col => !existingFilters.includes(col.id));

  const handleColumnSelect = (columnId: string) => {
    const col = filterColumns.find(c => c.id === columnId);
    setSelectedColumn(col || null);
    setSelectedCondition(null);
    setValue('');
    setValueTo('');
  };

  const handleConditionSelect = (conditionId: MobileFilterCondition) => {
    const conditions = selectedColumn ? getConditionsForType(selectedColumn.type) : [];
    const cond = conditions.find(c => c.id === conditionId);
    setSelectedCondition(cond || null);
    setValue('');
    setValueTo('');
  };

  const handleApply = () => {
    if (!selectedColumn || !selectedCondition) return;

    const filter: MobileActiveFilter = {
      columnId: selectedColumn.id,
      condition: selectedCondition.id,
    };

    if (selectedCondition.needsValue) {
      if (selectedColumn.type === 'number') {
        filter.value = Number(value);
        if (selectedCondition.needsSecondValue) {
          filter.valueTo = Number(valueTo);
        }
      } else if (selectedColumn.type === 'boolean') {
        filter.value = value === 'true';
      } else {
        filter.value = value;
      }
    }

    onAdd(filter);
    onClose();
  };

  const conditions = selectedColumn ? getConditionsForType(selectedColumn.type) : [];
  const selectOptions = selectedColumn?.type === 'select' ? getSelectOptions(selectedColumn.id) : [];
  const canApply = selectedColumn && selectedCondition && 
    (!selectedCondition.needsValue || value.trim() !== '') &&
    (!selectedCondition.needsSecondValue || valueTo.trim() !== '');

  return (
    <div className="kerzz-mfs-popup-overlay" onClick={onClose}>
      <div className="kerzz-mfs-popup" onClick={e => e.stopPropagation()}>
        <div className="kerzz-mfs-popup-header">
          <span>{labels.addFilter}</span>
          <button type="button" className="kerzz-mfs-popup-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="kerzz-mfs-popup-content">
          {/* Step 1: Select Field */}
          <div className="kerzz-mfs-popup-section">
            <label className="kerzz-mfs-popup-label">{labels.selectField}</label>
            <select
              className="kerzz-mfs-popup-select"
              value={selectedColumn?.id || ''}
              onChange={e => handleColumnSelect(e.target.value)}
            >
              <option value="">{labels.selectField}</option>
              {availableColumns.map(col => (
                <option key={col.id} value={col.id}>{col.header}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Condition */}
          {selectedColumn && (
            <div className="kerzz-mfs-popup-section">
              <label className="kerzz-mfs-popup-label">{labels.selectCondition}</label>
              <select
                className="kerzz-mfs-popup-select"
                value={selectedCondition?.id || ''}
                onChange={e => handleConditionSelect(e.target.value as MobileFilterCondition)}
              >
                <option value="">{labels.selectCondition}</option>
                {conditions.map(cond => (
                  <option key={cond.id} value={cond.id}>{labels[cond.labelKey]}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Enter Value */}
          {selectedColumn && selectedCondition?.needsValue && (
            <div className="kerzz-mfs-popup-section">
              <label className="kerzz-mfs-popup-label">
                {selectedCondition.needsSecondValue ? 'Min' : labels.enterValue}
              </label>
              
              {selectedColumn.type === 'boolean' ? (
                <select
                  className="kerzz-mfs-popup-select"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                >
                  <option value="">{labels.selectValue}</option>
                  <option value="true">{labels.yes}</option>
                  <option value="false">{labels.no}</option>
                </select>
              ) : selectedColumn.type === 'select' ? (
                <select
                  className="kerzz-mfs-popup-select"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                >
                  <option value="">{labels.selectValue}</option>
                  {selectOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={selectedColumn.type === 'number' ? 'number' : 'text'}
                  className="kerzz-mfs-popup-input"
                  placeholder={labels.enterValue}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  inputMode={selectedColumn.type === 'number' ? 'decimal' : 'text'}
                />
              )}
            </div>
          )}

          {/* Step 4: Second Value (for between) */}
          {selectedColumn && selectedCondition?.needsSecondValue && (
            <div className="kerzz-mfs-popup-section">
              <label className="kerzz-mfs-popup-label">Max</label>
              <input
                type="number"
                className="kerzz-mfs-popup-input"
                placeholder={labels.enterValue}
                value={valueTo}
                onChange={e => setValueTo(e.target.value)}
                inputMode="decimal"
              />
            </div>
          )}
        </div>

        <div className="kerzz-mfs-popup-footer">
          <button type="button" className="kerzz-mfs-popup-btn cancel" onClick={onClose}>
            {labels.cancel}
          </button>
          <button
            type="button"
            className="kerzz-mfs-popup-btn apply"
            onClick={handleApply}
            disabled={!canApply}
          >
            {labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Sort Popup ──

interface AddSortPopupProps {
  sortColumns: { id: string; header: string }[];
  labels: LocaleLabels;
  onAdd: (columnId: string, direction: 'asc' | 'desc') => void;
  onClose: () => void;
}

function AddSortPopup({ sortColumns, labels, onAdd, onClose }: AddSortPopupProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const handleApply = () => {
    if (!selectedColumn) return;
    onAdd(selectedColumn, direction);
    onClose();
  };

  return (
    <div className="kerzz-mfs-popup-overlay" onClick={onClose}>
      <div className="kerzz-mfs-popup" onClick={e => e.stopPropagation()}>
        <div className="kerzz-mfs-popup-header">
          <span>{labels.addSort}</span>
          <button type="button" className="kerzz-mfs-popup-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="kerzz-mfs-popup-content">
          <div className="kerzz-mfs-popup-section">
            <label className="kerzz-mfs-popup-label">{labels.selectField}</label>
            <select
              className="kerzz-mfs-popup-select"
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
            >
              <option value="">{labels.selectField}</option>
              {sortColumns.map(col => (
                <option key={col.id} value={col.id}>{col.header}</option>
              ))}
            </select>
          </div>

          {selectedColumn && (
            <div className="kerzz-mfs-popup-section">
              <label className="kerzz-mfs-popup-label">{labels.sort}</label>
              <div className="kerzz-mfs-popup-direction">
                <button
                  type="button"
                  className={`kerzz-mfs-popup-dir-btn ${direction === 'asc' ? 'active' : ''}`}
                  onClick={() => setDirection('asc')}
                >
                  {labels.ascending}
                </button>
                <button
                  type="button"
                  className={`kerzz-mfs-popup-dir-btn ${direction === 'desc' ? 'active' : ''}`}
                  onClick={() => setDirection('desc')}
                >
                  {labels.descending}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="kerzz-mfs-popup-footer">
          <button type="button" className="kerzz-mfs-popup-btn cancel" onClick={onClose}>
            {labels.cancel}
          </button>
          <button
            type="button"
            className="kerzz-mfs-popup-btn apply"
            onClick={handleApply}
            disabled={!selectedColumn}
          >
            {labels.apply}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──

function MobileFilterSortInner<TData>({
  data,
  filterColumns,
  sortColumns,
  locale = 'tr',
  onFilteredDataChange,
  defaultExpanded = false,
  className = '',
}: MobileFilterSortProps<TData>) {
  const labels = LOCALE_LABELS[locale];
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showSortPopup, setShowSortPopup] = useState(false);

  const {
    filteredData,
    filterState,
    sortState,
    activeFilterCount,
    setFilter,
    removeFilter,
    clearAllFilters,
    setSort,
    clearSort,
    getSelectOptions,
  } = useMobileFilterSort({
    data,
    filterColumns,
    sortColumns,
    locale,
  });

  useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData, onFilteredDataChange]);

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const activeFilters = Object.values(filterState);
  const hasSort = sortState.columnId !== null;
  const hasFiltersOrSort = activeFilterCount > 0 || hasSort;

  const sortColumn = sortState.columnId
    ? sortColumns.find(c => c.id === sortState.columnId)
    : null;

  return (
    <div className={`kerzz-mfs ${className}`}>
      {/* Header */}
      <button
        type="button"
        className="kerzz-mfs-header"
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <div className="kerzz-mfs-summary">
          <FilterIcon className="kerzz-mfs-icon" />
          {hasFiltersOrSort ? (
            <span className="kerzz-mfs-count">
              {activeFilterCount > 0 && `${activeFilterCount} ${labels.activeFilters}`}
              {activeFilterCount > 0 && hasSort && ' • '}
              {hasSort && sortColumn && `${sortColumn.header}`}
            </span>
          ) : (
            <span className="kerzz-mfs-count muted">{labels.noFilters}</span>
          )}
        </div>
        <ChevronDownIcon className={`kerzz-mfs-chevron ${expanded ? 'expanded' : ''}`} />
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="kerzz-mfs-content">
          {/* Active Chips */}
          <div className="kerzz-mfs-chips">
            {/* Sort Chip */}
            {hasSort && sortColumn && (
              <SortChip
                columnHeader={sortColumn.header}
                direction={sortState.direction}
                labels={labels}
                onRemove={clearSort}
              />
            )}

            {/* Filter Chips */}
            {activeFilters.map(filter => {
              const column = filterColumns.find(c => c.id === filter.columnId);
              if (!column) return null;
              return (
                <FilterChip
                  key={filter.columnId}
                  filter={filter}
                  column={column}
                  labels={labels}
                  onRemove={() => removeFilter(filter.columnId)}
                />
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="kerzz-mfs-actions">
            {!hasSort && (
              <button
                type="button"
                className="kerzz-mfs-add-btn"
                onClick={() => setShowSortPopup(true)}
              >
                <PlusIcon className="kerzz-mfs-add-icon" />
                {labels.addSort}
              </button>
            )}

            <button
              type="button"
              className="kerzz-mfs-add-btn"
              onClick={() => setShowFilterPopup(true)}
            >
              <PlusIcon className="kerzz-mfs-add-icon" />
              {labels.addFilter}
            </button>

            {hasFiltersOrSort && (
              <button
                type="button"
                className="kerzz-mfs-clear-btn"
                onClick={() => {
                  clearAllFilters();
                  clearSort();
                }}
              >
                {labels.clearAll}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popups */}
      {showFilterPopup && (
        <AddFilterPopup
          filterColumns={filterColumns}
          existingFilters={Object.keys(filterState)}
          labels={labels}
          getSelectOptions={getSelectOptions}
          onAdd={setFilter}
          onClose={() => setShowFilterPopup(false)}
        />
      )}

      {showSortPopup && (
        <AddSortPopup
          sortColumns={sortColumns}
          labels={labels}
          onAdd={setSort}
          onClose={() => setShowSortPopup(false)}
        />
      )}
    </div>
  );
}

export const MobileFilterSort = memo(MobileFilterSortInner) as typeof MobileFilterSortInner;
