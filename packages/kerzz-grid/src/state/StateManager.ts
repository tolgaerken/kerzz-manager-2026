import type { GridState } from '../types/grid.types';
import type { StorageAdapter } from './adapters/types';
import { localStorageAdapter } from './adapters/localStorageAdapter';
import { DEFAULT_GRID_SETTINGS } from '../types/settings.types';

const CURRENT_VERSION = 3;

export class StateManager {
  private adapter: StorageAdapter;
  private key: string;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(key: string, storageType: 'localStorage' | 'sessionStorage' | 'none' = 'localStorage') {
    this.key = key;
    this.adapter =
      storageType === 'none'
        ? { load: () => null, save: () => {}, remove: () => {} }
        : localStorageAdapter;
  }

  load(): GridState | null {
    const state = this.adapter.load(this.key);
    if (!state) return null;

    // Migration support
    if (state.version !== CURRENT_VERSION) {
      return this.migrate(state);
    }

    return state;
  }

  save(state: GridState): void {
    // Debounced save to avoid excessive writes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.adapter.save(this.key, { ...state, version: CURRENT_VERSION });
    }, 150);
  }

  /** Incrementally update only the changed part of state */
  patch(current: GridState, patch: Partial<GridState>): GridState {
    const next = { ...current, ...patch };
    this.save(next);
    return next;
  }

  remove(): void {
    this.adapter.remove(this.key);
  }

  private migrate(state: GridState): GridState {
    // Ensure disabledFilters exists for older persisted states
    const migrated = { ...state, version: CURRENT_VERSION };
    if (!migrated.disabledFilters) {
      migrated.disabledFilters = {};
    }
    // Ensure settings exists for older persisted states (v2 migration)
    if (!migrated.settings) {
      migrated.settings = { ...DEFAULT_GRID_SETTINGS };
    }
    // Ensure columnPinned exists for older persisted states (v3 migration)
    if (!migrated.columnPinned) {
      migrated.columnPinned = {};
    }
    return migrated;
  }

  static createDefault(): GridState {
    return {
      columnWidths: {},
      columnOrder: [],
      columnVisibility: {},
      columnPinned: {},
      sorting: [],
      filters: {},
      disabledFilters: {},
      settings: { ...DEFAULT_GRID_SETTINGS },
      version: CURRENT_VERSION,
    };
  }
}
