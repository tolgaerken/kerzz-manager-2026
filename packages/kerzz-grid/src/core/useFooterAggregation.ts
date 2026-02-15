import { useMemo } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { FooterAggregateResult, FooterConfig, AggregateType } from '../types/footer.types';
import type { FooterAggregationSetting } from '../types/settings.types';
import type { GridLocale } from '../types/locale.types';
import { computeAggregate } from '../utils/aggregation';
import { useLocale } from '../i18n/useLocale';

interface UseFooterAggregationOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
  /** Footer aggregation settings from GridSettings (columnId -> aggregation type) */
  footerAggregationSettings?: Record<string, FooterAggregationSetting>;
}

/** Get auto-label for aggregation type (except 'sum' which shows just the value) */
function getAutoLabel(aggregate: AggregateType, locale: GridLocale): string | undefined {
  const labelMap: Partial<Record<AggregateType, string>> = {
    avg: locale.footerAvg,
    count: locale.footerCount,
    min: locale.footerMin,
    max: locale.footerMax,
    distinctCount: locale.footerDistinctCount,
  };
  
  return labelMap[aggregate];
}

export function useFooterAggregation<TData>({
  data,
  columns,
  footerAggregationSettings = {},
}: UseFooterAggregationOptions<TData>): Map<string, FooterAggregateResult> {
  const locale = useLocale();
  // Columns that have footer config OR have a setting from the settings panel
  const columnsWithFooter = useMemo(() => {
    return columns.filter((c) => {
      // Has static footer config
      if (c.footer) return true;
      // Has dynamic setting from settings panel (and not 'none')
      const setting = footerAggregationSettings[c.id];
      if (setting && setting !== 'none') return true;
      return false;
    });
  }, [columns, footerAggregationSettings]);

  return useMemo(() => {
    const results = new Map<string, FooterAggregateResult>();

    // Early return if no footer columns or no data
    if (columnsWithFooter.length === 0 || data.length === 0) return results;

    for (const col of columnsWithFooter) {
      // Determine footer config: static config takes precedence, then settings panel
      let footerConfig: FooterConfig | undefined = col.footer;
      
      const setting = footerAggregationSettings[col.id];
      if (setting && setting !== 'none') {
        // Settings panel overrides or provides the aggregation type
        // Auto-generate label for non-sum aggregations if no static label exists
        const autoLabel = col.footer?.label ?? getAutoLabel(setting, locale);
        
        footerConfig = {
          aggregate: setting,
          label: autoLabel,
          format: col.footer?.format,
          customFn: col.footer?.customFn,
        };
      }

      if (!footerConfig) continue;

      const values: unknown[] = [];
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const value = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[col.accessorKey ?? col.id];
        values.push(value);
      }

      results.set(col.id, computeAggregate(values, footerConfig, col.id));
    }

    return results;
  }, [data, columnsWithFooter, footerAggregationSettings, locale]);
}
