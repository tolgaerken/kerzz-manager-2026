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
  const processNextItemRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // State güncellerken ref'i de anlık senkronize eden yardımcı
  const updateProgress = useCallback(
    (updater: (prev: BatchCollectProgress | null) => BatchCollectProgress | null) => {
      setProgress((prev) => {
        const next = updater(prev);
        progressRef.current = next;
        return next;
      });
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const processNextItem = useCallback(
    async () => {
      const currentProgress = progressRef.current;
      if (!currentProgress) return;

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
        updateProgress((prev) => {
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

      // Item durumunu "processing" olarak güncelle
      updateProgress((prev) => {
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

        // En güncel state üzerinden güncelle (stale closure önlemi)
        updateProgress((prev) => {
          if (!prev) return null;
          const newItems = [...prev.items];

          if (!result.success) {
            newItems[nextIndex] = {
              ...newItems[nextIndex],
              status: "error",
              error: result.paymentError || result.message
            };
            console.log(
              `[BatchCollect] HATA [${nextIndex + 1}/${prev.totalCount}]`,
              { invoiceNo: item.invoice.invoiceNumber, error: result.paymentError || result.message }
            );
          } else {
            newItems[nextIndex] = {
              ...newItems[nextIndex],
              status: "completed"
            };
            console.log(
              `[BatchCollect] BAŞARILI [${nextIndex + 1}/${prev.totalCount}]`,
              { invoiceNo: item.invoice.invoiceNumber }
            );
          }

          const completedCount = newItems.filter(
            (i) => i.status === "completed" || i.status === "error"
          ).length;
          const errorCount = newItems.filter((i) => i.status === "error").length;

          return {
            ...prev,
            items: newItems,
            completedCount,
            errorCount
          };
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
        console.error(
          `[BatchCollect] EXCEPTION [${nextIndex + 1}/${currentProgress.totalCount}]`,
          { invoiceNo: item.invoice.invoiceNumber, error: errorMessage }
        );

        // En güncel state üzerinden hata durumunu güncelle
        updateProgress((prev) => {
          if (!prev) return null;
          const newItems = [...prev.items];
          newItems[nextIndex] = {
            ...newItems[nextIndex],
            status: "error",
            error: errorMessage
          };

          const completedCount = newItems.filter(
            (i) => i.status === "completed" || i.status === "error"
          ).length;
          const errorCount = newItems.filter((i) => i.status === "error").length;

          return {
            ...prev,
            items: newItems,
            completedCount,
            errorCount
          };
        });
      }

      // Sonraki item'a geç - ref üzerinden çağır (stale closure önlemi)
      if (processNextItemRef.current) {
        await processNextItemRef.current();
      }
    },
    [queryClient, updateProgress]
  );

  // processNextItem ref'ini güncelle
  useEffect(() => {
    processNextItemRef.current = processNextItem;
  }, [processNextItem]);

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

      const initialProgress: BatchCollectProgress = {
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

      // Ref'i anlık senkronize et, ardından işlemi başlat
      updateProgress(() => initialProgress);
      processNextItem();
    },
    [processNextItem, updateProgress]
  );

  const pauseBatchCollect = useCallback(() => {
    isPausedRef.current = true;
    updateProgress((prev) => {
      if (!prev) return null;
      return { ...prev, status: "paused" };
    });
  }, [updateProgress]);

  const resumeBatchCollect = useCallback(() => {
    isPausedRef.current = false;
    const currentProgress = progressRef.current;
    if (!currentProgress) return;
    console.log("[BatchCollect] Devam ediliyor", {
      completed: currentProgress.completedCount,
      total: currentProgress.totalCount
    });
    updateProgress((prev) => {
      if (!prev) return null;
      return { ...prev, status: "running" as const };
    });
    processNextItem();
  }, [processNextItem, updateProgress]);

  const cancelBatchCollect = useCallback(() => {
    isPausedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    updateProgress(() => null);
  }, [updateProgress]);

  const minimizeBatchCollect = useCallback(() => {
    updateProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: true };
    });
  }, [updateProgress]);

  const maximizeBatchCollect = useCallback(() => {
    updateProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: false };
    });
  }, [updateProgress]);

  const clearBatchCollect = useCallback(() => {
    updateProgress(() => null);
  }, [updateProgress]);

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
