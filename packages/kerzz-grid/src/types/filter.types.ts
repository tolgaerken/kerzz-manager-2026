export type TextFilterCondition =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'notContains'
  | 'blank'
  | 'notBlank';

export type NumberFilterCondition =
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between';

export type DateFilterCondition =
  | 'before'
  | 'after'
  | 'between'
  | 'equals'
  | 'today'
  | 'thisWeek';

export type FilterCondition =
  | TextFilterCondition
  | NumberFilterCondition
  | DateFilterCondition;

export interface DropdownFilterConfig {
  type: 'dropdown';
  /** Show "(Blanks)" option for null/undefined/empty values */
  showBlanks?: boolean;
  /** Show count of rows for each filter value */
  showCounts?: boolean;
}

export interface InputFilterConfig {
  type: 'input';
  /** Available conditions for this filter */
  conditions?: FilterCondition[];
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export interface DateTreeFilterConfig {
  type: 'dateTree';
  /** Show "(Blanks)" option for null/undefined/empty values */
  showBlanks?: boolean;
}

export interface NumericFilterConfig {
  type: 'numeric';
  /** Available conditions for this filter */
  conditions?: NumberFilterCondition[];
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Step value for number input */
  step?: number;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
}

export type ColumnFilterConfig = DropdownFilterConfig | InputFilterConfig | DateTreeFilterConfig | NumericFilterConfig;

export interface ActiveDropdownFilter {
  type: 'dropdown';
  selectedValues: Set<string>;
  showBlanks: boolean;
}

export interface ActiveInputFilter {
  type: 'input';
  condition: FilterCondition;
  value: string;
  valueTo?: string; // For 'between' condition
}

export interface ActiveDateTreeFilter {
  type: 'dateTree';
  /** Selected day keys in "YYYY-MM-DD" format */
  selectedDays: Set<string>;
  showBlanks: boolean;
}

export interface ActiveNumericFilter {
  type: 'numeric';
  condition: NumberFilterCondition;
  value: string;
  valueTo?: string; // For 'between' condition
}

export type ActiveFilter = ActiveDropdownFilter | ActiveInputFilter | ActiveDateTreeFilter | ActiveNumericFilter;

export interface FilterState {
  [columnId: string]: ActiveFilter;
}

/** Tracks which filters are temporarily disabled (true = disabled) */
export interface DisabledFilterState {
  [columnId: string]: boolean;
}

export interface DropdownFilterValue {
  value: string;
  displayValue: string;
  count: number;
}
