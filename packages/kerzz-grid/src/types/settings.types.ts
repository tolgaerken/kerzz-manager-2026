import type { SelectionMode } from './selection.types';
import type { AggregateType } from './footer.types';

/**
 * Footer aggregation setting for a column
 * 'none' means no aggregation is shown
 */
export type FooterAggregationSetting = AggregateType | 'none';

/**
 * Grid settings that can be configured via the Settings Panel
 */
export interface GridSettings {
  /** Selection mode: none, single, or multiple */
  selectionMode: SelectionMode;
  /** Header filter visibility per column (columnId -> enabled) */
  headerFilters: Record<string, boolean>;
  /** Footer aggregation type per column (columnId -> aggregation type or 'none') */
  footerAggregation: Record<string, FooterAggregationSetting>;
  /** Enable alternating row colors (zebra striping) */
  stripedRows: boolean;
}

/**
 * Default grid settings
 */
export const DEFAULT_GRID_SETTINGS: GridSettings = {
  selectionMode: 'single',
  headerFilters: {},
  footerAggregation: {},
  stripedRows: false,
};
