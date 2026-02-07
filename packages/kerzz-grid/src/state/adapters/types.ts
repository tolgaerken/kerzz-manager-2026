import type { GridState } from '../../types/grid.types';

export interface StorageAdapter {
  load(key: string): GridState | null;
  save(key: string, state: GridState): void;
  remove(key: string): void;
}
