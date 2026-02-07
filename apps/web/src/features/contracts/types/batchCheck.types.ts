import type { Contract, CheckContractResult } from "./contract.types";

export type BatchCheckStatus = "idle" | "running" | "paused" | "completed" | "error";

export interface BatchCheckItem {
  contractId: string;
  contract: Contract;
  status: "pending" | "processing" | "completed" | "error";
  result?: CheckContractResult;
  error?: string;
}

export interface BatchCheckProgress {
  id: string;
  status: BatchCheckStatus;
  items: BatchCheckItem[];
  currentIndex: number;
  totalCount: number;
  completedCount: number;
  errorCount: number;
  startedAt?: Date;
  completedAt?: Date;
  isMinimized: boolean;
}

export interface BatchCheckContextValue {
  progress: BatchCheckProgress | null;
  startBatchCheck: (contracts: Contract[]) => void;
  pauseBatchCheck: () => void;
  resumeBatchCheck: () => void;
  cancelBatchCheck: () => void;
  minimizeBatchCheck: () => void;
  maximizeBatchCheck: () => void;
  clearBatchCheck: () => void;
}
