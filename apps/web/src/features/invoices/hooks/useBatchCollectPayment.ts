import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collectPayment } from "../../automated-payments/api/automatedPaymentsApi";
import { invoicesKeys } from "./useInvoices";
import type { Invoice } from "../types";
import type {
  BatchCollectProgress,
  BatchCollectItem,
  BatchCollectContextValue
} from "../types/batchCollect.types";

function generateId(): string {
  return `batch-collect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useBatchCollectPayment(): BatchCollectContextValue {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BatchCollectProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const processNextItem = useCallback(
    async (currentProgress: BatchCollectProgress) => {
      if (isPausedRef.current) return;
      if (currentProgress.status !== "running") return;

      const nextIndex = currentProgress.items.findIndex(
        (item) => item.status === "pending"
      );

      if (nextIndex === -1) {
        // All items processed
        setProgress((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "completed",
            completedAt: new Date()
          };
        });
        // Invalidate queries after batch completion
        queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
        return;
      }

      const item = currentProgress.items[nextIndex];

      // Update item status to processing
      setProgress((prev) => {
        if (!prev) return null;
        const newItems = [...prev.items];
        newItems[nextIndex] = { ...newItems[nextIndex], status: "processing" };
        return {
          ...prev,
          items: newItems,
          currentIndex: nextIndex
        };
      });

      try {
        const result = await collectPayment({
          customerId: item.invoice.customerId,
          amount: item.invoice.grandTotal,
          mode: "custom",
          invoiceNo: item.invoice.invoiceNumber
        });

        setProgress((prev) => {
          if (!prev) return null;
          const newItems = [...prev.items];

          if (!result.success) {
            newItems[nextIndex] = {
              ...newItems[nextIndex],
              status: "error",
              error: result.paymentError || result.message
            };
          } else {
            newItems[nextIndex] = {
              ...newItems[nextIndex],
              status: "completed"
            };
          }

          const completedCount = newItems.filter(
            (i) => i.status === "completed" || i.status === "error"
          ).length;
          const errorCount = newItems.filter((i) => i.status === "error").length;

          const newProgress: BatchCollectProgress = {
            ...prev,
            items: newItems,
            completedCount,
            errorCount
          };

          // Process next item
          setTimeout(() => processNextItem(newProgress), 300);

          return newProgress;
        });
      } catch (error) {
        setProgress((prev) => {
          if (!prev) return null;
          const newItems = [...prev.items];
          newItems[nextIndex] = {
            ...newItems[nextIndex],
            status: "error",
            error: error instanceof Error ? error.message : "Bilinmeyen hata"
          };

          const completedCount = newItems.filter(
            (i) => i.status === "completed" || i.status === "error"
          ).length;
          const errorCount = newItems.filter((i) => i.status === "error").length;

          const newProgress: BatchCollectProgress = {
            ...prev,
            items: newItems,
            completedCount,
            errorCount
          };

          // Continue with next item even on error
          setTimeout(() => processNextItem(newProgress), 300);

          return newProgress;
        });
      }
    },
    [queryClient]
  );

  const startBatchCollect = useCallback(
    (invoices: Invoice[]) => {
      if (invoices.length === 0) return;

      isPausedRef.current = false;
      abortControllerRef.current = new AbortController();

      const items: BatchCollectItem[] = invoices.map((invoice) => ({
        invoiceId: invoice._id,
        invoice,
        status: "pending"
      }));

      const newProgress: BatchCollectProgress = {
        id: generateId(),
        status: "running",
        items,
        currentIndex: 0,
        totalCount: invoices.length,
        completedCount: 0,
        errorCount: 0,
        startedAt: new Date(),
        isMinimized: false
      };

      setProgress(newProgress);

      // Start processing
      setTimeout(() => processNextItem(newProgress), 100);
    },
    [processNextItem]
  );

  const pauseBatchCollect = useCallback(() => {
    isPausedRef.current = true;
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, status: "paused" };
    });
  }, []);

  const resumeBatchCollect = useCallback(() => {
    isPausedRef.current = false;
    setProgress((prev) => {
      if (!prev) return null;
      const newProgress = { ...prev, status: "running" as const };
      setTimeout(() => processNextItem(newProgress), 100);
      return newProgress;
    });
  }, [processNextItem]);

  const cancelBatchCollect = useCallback(() => {
    isPausedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProgress(null);
  }, []);

  const minimizeBatchCollect = useCallback(() => {
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: true };
    });
  }, []);

  const maximizeBatchCollect = useCallback(() => {
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: false };
    });
  }, []);

  const clearBatchCollect = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    progress,
    startBatchCollect,
    pauseBatchCollect,
    resumeBatchCollect,
    cancelBatchCollect,
    minimizeBatchCollect,
    maximizeBatchCollect,
    clearBatchCollect
  };
}
