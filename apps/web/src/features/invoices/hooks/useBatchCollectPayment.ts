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
  const progressRef = useRef<BatchCollectProgress | null>(null);

  // Ref'i state ile senkronize tut
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
      if (isPausedRef.current) {
        console.log("[BatchCollect] Duraklatıldı, işlem bekliyor");
        return;
      }
      if (currentProgress.status !== "running") {
        console.log("[BatchCollect] Status running değil:", currentProgress.status);
        return;
      }

      const nextIndex = currentProgress.items.findIndex(
        (item) => item.status === "pending"
      );

      if (nextIndex === -1) {
        console.log("[BatchCollect] Tüm item'lar işlendi ✓");
        setProgress((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "completed",
            completedAt: new Date()
          };
        });
        queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
        return;
      }

      const item = currentProgress.items[nextIndex];
      console.log(
        `[BatchCollect] İşleniyor [${nextIndex + 1}/${currentProgress.totalCount}]`,
        { invoiceNo: item.invoice.invoiceNumber, customerId: item.invoice.customerId, amount: item.invoice.grandTotal }
      );

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

      let newProgress: BatchCollectProgress;

      try {
        const result = await collectPayment({
          customerId: item.invoice.customerId,
          amount: item.invoice.grandTotal,
          mode: "custom",
          invoiceNo: item.invoice.invoiceNumber
        });

        const newItems = [...currentProgress.items];

        if (!result.success) {
          newItems[nextIndex] = {
            ...newItems[nextIndex],
            status: "error",
            error: result.paymentError || result.message
          };
          console.log(
            `[BatchCollect] HATA [${nextIndex + 1}/${currentProgress.totalCount}]`,
            { invoiceNo: item.invoice.invoiceNumber, error: result.paymentError || result.message }
          );
        } else {
          newItems[nextIndex] = {
            ...newItems[nextIndex],
            status: "completed"
          };
          console.log(
            `[BatchCollect] BAŞARILI [${nextIndex + 1}/${currentProgress.totalCount}]`,
            { invoiceNo: item.invoice.invoiceNumber }
          );
        }

        const completedCount = newItems.filter(
          (i) => i.status === "completed" || i.status === "error"
        ).length;
        const errorCount = newItems.filter((i) => i.status === "error").length;

        newProgress = {
          ...currentProgress,
          items: newItems,
          completedCount,
          errorCount
        };

        setProgress((prev) => {
          if (!prev) return null;
          return { ...newProgress, isMinimized: prev.isMinimized };
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
        console.error(
          `[BatchCollect] EXCEPTION [${nextIndex + 1}/${currentProgress.totalCount}]`,
          { invoiceNo: item.invoice.invoiceNumber, error: errorMessage }
        );

        const newItems = [...currentProgress.items];
        newItems[nextIndex] = {
          ...newItems[nextIndex],
          status: "error",
          error: errorMessage
        };

        const completedCount = newItems.filter(
          (i) => i.status === "completed" || i.status === "error"
        ).length;
        const errorCount = newItems.filter((i) => i.status === "error").length;

        newProgress = {
          ...currentProgress,
          items: newItems,
          completedCount,
          errorCount
        };

        setProgress((prev) => {
          if (!prev) return null;
          return { ...newProgress, isMinimized: prev.isMinimized };
        });
      }

      // Sonraki item'a geç (setProgress dışında, setTimeout yok)
      await processNextItem(newProgress);
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

      console.log(`[BatchCollect] Batch başlatıldı — ${invoices.length} fatura`, {
        invoiceNos: invoices.map((inv) => inv.invoiceNumber)
      });

      setProgress(newProgress);
      processNextItem(newProgress);
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
    const currentProgress = progressRef.current;
    if (!currentProgress) return;
    console.log("[BatchCollect] Devam ediliyor", {
      completed: currentProgress.completedCount,
      total: currentProgress.totalCount
    });
    const newProgress = { ...currentProgress, status: "running" as const };
    setProgress(newProgress);
    processNextItem(newProgress);
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
