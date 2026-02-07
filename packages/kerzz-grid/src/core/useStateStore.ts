import { useState, useCallback, useRef, useEffect } from 'react';
import type { GridState } from '../types/grid.types';
import type { GridColumnDef } from '../types/column.types';
import type { FilterState } from '../types/filter.types';
import type { SortingState } from '@tanstack/react-table';
import { StateManager } from '../state/StateManager';

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
  resetState: () => void;
}

export function useStateStore({
  stateKey,
  stateStorage = 'localStorage',
  columns,
}: UseStateStoreOptions): UseStateStoreReturn {
  const managerRef = useRef<StateManager | null>(null);

  const createDefaultState = useCallback((): GridState => {
    const defaults = StateManager.createDefault();
    defaults.columnOrder = columns.map((c) => c.id);
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

  const [state, setState] = useState<GridState>(() => {
    if (stateKey && stateStorage !== 'none') {
      const manager = new StateManager(stateKey, stateStorage);
      managerRef.current = manager;
      const stored = manager.load();
      if (stored) return stored;
    }
    return createDefaultState();
  });

  useEffect(() => {
    if (stateKey && stateStorage !== 'none') {
      managerRef.current = new StateManager(stateKey, stateStorage);
    }
  }, [stateKey, stateStorage]);

  const persist = useCallback(
    (next: GridState) => {
      managerRef.current?.save(next);
    },
    [],
  );

  const setColumnWidths = useCallback(
    (widths: Record<string, number>) => {
      setState((prev) => {
        const next = { ...prev, columnWidths: widths };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setColumnWidth = useCallback(
    (columnId: string, width: number) => {
      setState((prev) => {
        const next = {
          ...prev,
          columnWidths: { ...prev.columnWidths, [columnId]: width },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setColumnOrder = useCallback(
    (order: string[]) => {
      setState((prev) => {
        const next = { ...prev, columnOrder: order };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setColumnVisibility = useCallback(
    (visibility: Record<string, boolean>) => {
      setState((prev) => {
        const next = { ...prev, columnVisibility: visibility };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setSorting = useCallback(
    (sorting: SortingState) => {
      setState((prev) => {
        const next = { ...prev, sorting };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setFilters = useCallback(
    (filters: FilterState) => {
      setState((prev) => {
        const next = { ...prev, filters };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const resetState = useCallback(() => {
    managerRef.current?.remove();
    const defaults = createDefaultState();
    setState(defaults);
  }, [createDefaultState]);

  return {
    state,
    setColumnWidths,
    setColumnWidth,
    setColumnOrder,
    setColumnVisibility,
    setSorting,
    setFilters,
    resetState,
  };
}
