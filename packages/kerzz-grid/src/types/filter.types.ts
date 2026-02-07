export type TextFilterCondition =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'notContains';

export type NumberFilterCondition =
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
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

export type ColumnFilterConfig = DropdownFilterConfig | InputFilterConfig | DateTreeFilterConfig;

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

export type ActiveFilter = ActiveDropdownFilter | ActiveInputFilter | ActiveDateTreeFilter;

export interface FilterState {
  [columnId: string]: ActiveFilter;
}

export interface DropdownFilterValue {
  value: string;
  displayValue: string;
  count: number;
}
