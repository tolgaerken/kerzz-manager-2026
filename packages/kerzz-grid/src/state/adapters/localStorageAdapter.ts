import type { GridState } from '../../types/grid.types';
import type { StorageAdapter } from './types';

function reviveFilterState(state: GridState): GridState {
  if (!state.filters) return state;

  const filters = { ...state.filters };
  for (const key of Object.keys(filters)) {
    const filter = filters[key];
    if (filter.type === 'dropdown' && Array.isArray((filter as unknown as { selectedValues: string[] }).selectedValues)) {
      filters[key] = {
        ...filter,
        selectedValues: new Set((filter as unknown as { selectedValues: string[] }).selectedValues),
      };
    }
    if (filter.type === 'dateTree' && Array.isArray((filter as unknown as { selectedDays: string[] }).selectedDays)) {
      filters[key] = {
        ...filter,
        selectedDays: new Set((filter as unknown as { selectedDays: string[] }).selectedDays),
      };
    }
  }
  return { ...state, filters };
}

function serializeFilterState(state: GridState): unknown {
  const filters: Record<string, unknown> = {};
  for (const key of Object.keys(state.filters)) {
    const filter = state.filters[key];
    if (filter.type === 'dropdown') {
      filters[key] = {
        ...filter,
        selectedValues: Array.from(filter.selectedValues),
      };
    } else if (filter.type === 'dateTree') {
      filters[key] = {
        ...filter,
        selectedDays: Array.from(filter.selectedDays),
      };
    } else {
      filters[key] = filter;
    }
  }
  return { ...state, filters };
}

export const localStorageAdapter: StorageAdapter = {
  load(key: string): GridState | null {
    try {
      const raw = localStorage.getItem(`kz-grid-${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GridState;
      return reviveFilterState(parsed);
    } catch {
      return null;
    }
  },

  save(key: string, state: GridState): void {
    try {
      const serializable = serializeFilterState(state);
      localStorage.setItem(`kz-grid-${key}`, JSON.stringify(serializable));
    } catch {
      // silently fail
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`kz-grid-${key}`);
    } catch {
      // silently fail
    }
  },
};
