import type { AggregateType, FooterAggregateResult, FooterConfig } from '../types/footer.types';

export function computeAggregate(
  values: unknown[],
  config: FooterConfig,
  columnId: string,
): FooterAggregateResult {
  const { aggregate, label, format, customFn } = config;

  let numericValue: number;
  let stringValue: string | undefined;

  switch (aggregate) {
    case 'count':
      numericValue = values.length;
      break;
    case 'sum':
      numericValue = sumValues(values);
      break;
    case 'avg':
      numericValue = values.length > 0 ? sumValues(values) / values.length : 0;
      break;
    case 'min':
      numericValue = minValue(values);
      break;
    case 'max':
      numericValue = maxValue(values);
      break;
    case 'distinctCount':
      numericValue = new Set(values.map(String)).size;
      break;
    case 'custom': {
      const result = customFn ? customFn(values) : 0;
      if (typeof result === 'string') {
        numericValue = 0;
        stringValue = result;
      } else {
        numericValue = result;
      }
      break;
    }
    default:
      numericValue = 0;
  }

  const formattedValue =
    stringValue ?? (format ? format(numericValue) : formatNumber(numericValue));

  return {
    columnId,
    aggregate,
    value: stringValue ?? numericValue,
    formattedValue,
    label,
  };
}

function sumValues(values: unknown[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const n = Number(values[i]);
    if (!isNaN(n)) total += n;
  }
  return total;
}

function minValue(values: unknown[]): number {
  let min = Infinity;
  for (let i = 0; i < values.length; i++) {
    const n = Number(values[i]);
    if (!isNaN(n) && n < min) min = n;
  }
  return min === Infinity ? 0 : min;
}

function maxValue(values: unknown[]): number {
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const n = Number(values[i]);
    if (!isNaN(n) && n > max) max = n;
  }
  return max === -Infinity ? 0 : max;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function getAggregateLabel(
  aggregate: AggregateType,
  labels: Record<string, string>,
): string {
  const map: Record<AggregateType, string> = {
    sum: labels.footerSum ?? 'Sum',
    avg: labels.footerAvg ?? 'Avg',
    count: labels.footerCount ?? 'Count',
    min: labels.footerMin ?? 'Min',
    max: labels.footerMax ?? 'Max',
    distinctCount: labels.footerDistinctCount ?? 'Distinct',
    custom: '',
  };
  return map[aggregate] ?? '';
}
