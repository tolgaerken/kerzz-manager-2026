import type { Invoice } from "./invoice.types";

export type BatchCollectStatus = "idle" | "running" | "paused" | "completed" | "error";

export interface BatchCollectItem {
  invoiceId: string;
  invoice: Invoice;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

export interface BatchCollectProgress {
  id: string;
  status: BatchCollectStatus;
  items: BatchCollectItem[];
  currentIndex: number;
  totalCount: number;
  completedCount: number;
  errorCount: number;
  startedAt?: Date;
  completedAt?: Date;
  isMinimized: boolean;
}

export interface BatchCollectContextValue {
  progress: BatchCollectProgress | null;
  startBatchCollect: (invoices: Invoice[]) => void;
  pauseBatchCollect: () => void;
  resumeBatchCollect: () => void;
  cancelBatchCollect: () => void;
  minimizeBatchCollect: () => void;
  maximizeBatchCollect: () => void;
  clearBatchCollect: () => void;
}
