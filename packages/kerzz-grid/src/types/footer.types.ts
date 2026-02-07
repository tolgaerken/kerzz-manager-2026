export type AggregateType =
  | 'sum'
  | 'avg'
  | 'count'
  | 'min'
  | 'max'
  | 'distinctCount'
  | 'custom';

export interface FooterConfig {
  /** Aggregation type */
  aggregate: AggregateType;
  /** Label to show before the value (e.g., "Total:") */
  label?: string;
  /** Custom format function for the aggregated value */
  format?: (value: number) => string;
  /** Custom aggregation function (used when aggregate is 'custom') */
  customFn?: (values: unknown[]) => number | string;
}

export interface FooterAggregateResult {
  columnId: string;
  aggregate: AggregateType;
  value: number | string;
  formattedValue: string;
  label?: string;
}
