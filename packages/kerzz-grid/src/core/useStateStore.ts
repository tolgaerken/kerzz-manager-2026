import { useCallback, useRef, useEffect, useReducer } from 'react';
import type { GridState } from '../types/grid.types';
import type { GridColumnDef } from '../types/column.types';
import type { FilterState, DisabledFilterState } from '../types/filter.types';
import type { GridSettings, FooterAggregationSetting } from '../types/settings.types';
import type { SelectionMode } from '../types/selection.types';
import type { SortingState } from '@tanstack/react-table';
import { StateManager } from '../state/StateManager';
import { DEFAULT_GRID_SETTINGS } from '../types/settings.types';

interface UseStateStoreOptions {
  stateKey?: string;
  stateStorage?: 'localStorage' | 'sessionStorage' | 'none';
  columns: GridColumnDef[];
}

interface UseStateStoreReturn {
  state: GridState;
  setColumnWidths: (widths: Record<string, number>) => void;
  setColumnWidth: (columnId: string, width: number) => void;
  setColumnOrder: (order: string[]) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  setSorting: (sorting: SortingState) => void;
  setFilters: (filters: FilterState) => void;
  setDisabledFilters: (disabledFilters: DisabledFilterState) => void;
  setSettings: (settings: GridSettings) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setHeaderFilterEnabled: (columnId: string, enabled: boolean) => void;
  setFooterAggregation: (columnId: string, aggregation: FooterAggregationSetting) => void;
  resetState: () => void;
}

// --- Reducer ---

type StateAction =
  | { type: 'SET_COLUMN_WIDTHS'; widths: Record<string, number> }
  | { type: 'SET_COLUMN_WIDTH'; columnId: string; width: number }
  | { type: 'SET_COLUMN_ORDER'; order: string[] }
  | { type: 'SET_COLUMN_VISIBILITY'; visibility: Record<string, boolean> }
  | { type: 'SET_SORTING'; sorting: SortingState }
  | { type: 'SET_FILTERS'; filters: FilterState }
  | { type: 'SET_DISABLED_FILTERS'; disabledFilters: DisabledFilterState }
  | { type: 'SET_SETTINGS'; settings: GridSettings }
  | { type: 'SET_SELECTION_MODE'; mode: SelectionMode }
  | { type: 'SET_HEADER_FILTER_ENABLED'; columnId: string; enabled: boolean }
  | { type: 'SET_FOOTER_AGGREGATION'; columnId: string; aggregation: FooterAggregationSetting }
  | { type: 'RESET'; defaultState: GridState };

function stateReducer(state: GridState, action: StateAction): GridState {
  switch (action.type) {
    case 'SET_COLUMN_WIDTHS':
      return { ...state, columnWidths: action.widths };
    case 'SET_COLUMN_WIDTH':
      return {
        ...state,
        columnWidths: { ...state.columnWidths, [action.columnId]: action.width },
      };
    case 'SET_COLUMN_ORDER':
      return { ...state, columnOrder: action.order };
    case 'SET_COLUMN_VISIBILITY':
      return { ...state, columnVisibility: action.visibility };
    case 'SET_SORTING':
      return { ...state, sorting: action.sorting };
    case 'SET_FILTERS':
      return { ...state, filters: action.filters };
    case 'SET_DISABLED_FILTERS':
      return { ...state, disabledFilters: action.disabledFilters };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'SET_SELECTION_MODE':
      return {
        ...state,
        settings: { ...state.settings, selectionMode: action.mode },
      };
    case 'SET_HEADER_FILTER_ENABLED':
      return {
        ...state,
        settings: {
          ...state.settings,
          headerFilters: {
            ...state.settings.headerFilters,
            [action.columnId]: action.enabled,
          },
        },
      };
    case 'SET_FOOTER_AGGREGATION':
      return {
        ...state,
        settings: {
          ...state.settings,
          footerAggregation: {
            ...state.settings.footerAggregation,
            [action.columnId]: action.aggregation,
          },
        },
      };
    case 'RESET':
      return action.defaultState;
    default:
      return state;
  }
}

// --- Hook ---

export function useStateStore({
  stateKey,
  stateStorage = 'localStorage',
  columns,
}: UseStateStoreOptions): UseStateStoreReturn {
  const managerRef = useRef<StateManager | null>(null);

  const createDefaultState = useCallback((): GridState => {
    const defaults = StateManager.createDefault();
    defaults.columnOrder = Array.from(new Set(columns.map((c) => c.id)));
    defaults.columnVisibility = Object.fromEntries(
      columns.map((c) => [c.id, c.visible !== false]),
    );
    defaults.columnWidths = Object.fromEntries(
      columns
        .filter((c) => c.width != null)
        .map((c) => [c.id, c.width!]),
    );
    return defaults;
  }, [columns]);

  const [state, dispatch] = useReducer(stateReducer, undefined, () => {
    if (stateKey && stateStorage !== 'none') {
      const manager = new StateManager(stateKey, stateStorage);
      managerRef.current = manager;
      const stored = manager.load();
      if (stored) {
        // Ensure disabledFilters exists for backward compat
        if (!stored.disabledFilters) stored.disabledFilters = {};
        // Ensure settings exists for backward compat
        if (!stored.settings) stored.settings = { ...DEFAULT_GRID_SETTINGS };
        return stored;
      }
    }
    return createDefaultState();
  });

  useEffect(() => {
    if (stateKey && stateStorage !== 'none') {
      managerRef.current = new StateManager(stateKey, stateStorage);
    }
  }, [stateKey, stateStorage]);

  // Persist state changes
  useEffect(() => {
    managerRef.current?.save(state);
  }, [state]);

  const setColumnWidths = useCallback(
    (widths: Record<string, number>) => {
      dispatch({ type: 'SET_COLUMN_WIDTHS', widths });
    },
    [],
  );

  const setColumnWidth = useCallback(
    (columnId: string, width: number) => {
      dispatch({ type: 'SET_COLUMN_WIDTH', columnId, width });
    },
    [],
  );

  const setColumnOrder = useCallback(
    (order: string[]) => {
      dispatch({ type: 'SET_COLUMN_ORDER', order });
    },
    [],
  );

  const setColumnVisibility = useCallback(
    (visibility: Record<string, boolean>) => {
      dispatch({ type: 'SET_COLUMN_VISIBILITY', visibility });
    },
    [],
  );

  const setSorting = useCallback(
    (sorting: SortingState) => {
      dispatch({ type: 'SET_SORTING', sorting });
    },
    [],
  );

  const setFilters = useCallback(
    (filters: FilterState) => {
      dispatch({ type: 'SET_FILTERS', filters });
    },
    [],
  );

  const setDisabledFilters = useCallback(
    (disabledFilters: DisabledFilterState) => {
      dispatch({ type: 'SET_DISABLED_FILTERS', disabledFilters });
    },
    [],
  );

  const setSettings = useCallback(
    (settings: GridSettings) => {
      dispatch({ type: 'SET_SETTINGS', settings });
    },
    [],
  );

  const setSelectionMode = useCallback(
    (mode: SelectionMode) => {
      dispatch({ type: 'SET_SELECTION_MODE', mode });
    },
    [],
  );

  const setHeaderFilterEnabled = useCallback(
    (columnId: string, enabled: boolean) => {
      dispatch({ type: 'SET_HEADER_FILTER_ENABLED', columnId, enabled });
    },
    [],
  );

  const setFooterAggregation = useCallback(
    (columnId: string, aggregation: FooterAggregationSetting) => {
      dispatch({ type: 'SET_FOOTER_AGGREGATION', columnId, aggregation });
    },
    [],
  );

  const resetState = useCallback(() => {
    managerRef.current?.remove();
    dispatch({ type: 'RESET', defaultState: createDefaultState() });
  }, [createDefaultState]);

  return {
    state,
    setColumnWidths,
    setColumnWidth,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
    setFilters,
    setDisabledFilters,
    setSettings,
    setSelectionMode,
    setHeaderFilterEnabled,
    setFooterAggregation,
    resetState,
  };
}
