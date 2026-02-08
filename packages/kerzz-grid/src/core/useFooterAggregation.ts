import { useMemo } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { FooterAggregateResult } from '../types/footer.types';
import { computeAggregate } from '../utils/aggregation';

interface UseFooterAggregationOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
}

export function useFooterAggregation<TData>({
  data,
  columns,
}: UseFooterAggregationOptions<TData>): Map<string, FooterAggregateResult> {
  // Pre-filter columns with footer config to avoid unnecessary work
  const columnsWithFooter = useMemo(
    () => columns.filter((c) => c.footer),
    [columns],
  );

  return useMemo(() => {
    const results = new Map<string, FooterAggregateResult>();

    // Early return if no footer columns or no data
    if (columnsWithFooter.length === 0 || data.length === 0) return results;

    for (const col of columnsWithFooter) {
      if (!col.footer) continue;

      const values: unknown[] = [];
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const value = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[col.accessorKey ?? col.id];
        values.push(value);
      }

      results.set(col.id, computeAggregate(values, col.footer, col.id));
    }

    return results;
  }, [data, columnsWithFooter]);
}
