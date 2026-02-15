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

/**
 * Item sonuçlandırma bilgisi
 */
interface ItemResult {
  index: number;
  status: "completed" | "error";
  error?: string;
}

/**
 * Progress state'ini item sonucuna göre günceller
 */
function applyItemResult(
  prev: BatchCollectProgress | null,
  result: ItemResult
): BatchCollectProgress | null {
  if (!prev) return null;

  const newItems = [...prev.items];
  newItems[result.index] = {
    ...newItems[result.index],
    status: result.status,
    error: result.error
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
}

export function useBatchCollectPayment(): BatchCollectContextValue {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BatchCollectProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const progressRef = useRef<BatchCollectProgress | null>(null);
  const isProcessingRef = useRef(false);

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

  // Ref'i senkron olarak günceller (döngü içinde kullanım için)
  const updateProgressSync = useCallback(
    (updater: (prev: BatchCollectProgress | null) => BatchCollectProgress | null) => {
      const next = updater(progressRef.current);
      progressRef.current = next;
      setProgress(next);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Batch işleme döngüsü - iteratif yaklaşım (rekürsif değil)
   */
  const runBatchLoop = useCallback(async () => {
    // Çift çalışmayı önle
    if (isProcessingRef.current) {
      console.log("[BatchCollect] Döngü zaten çalışıyor, atlanıyor");
      return;
    }
    isProcessingRef.current = true;

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // Her iterasyonda güncel state'i oku
        const currentProgress = progressRef.current;

        // Çıkış koşulları
        if (!currentProgress) {
          console.log("[BatchCollect] Progress null, döngü sonlandırılıyor");
          break;
        }

        if (isCancelledRef.current) {
          console.log("[BatchCollect] İptal edildi, döngü sonlandırılıyor");
          break;
        }

        if (isPausedRef.current) {
          console.log("[BatchCollect] Duraklatıldı, döngü bekliyor");
          break;
        }

        if (currentProgress.status !== "running") {
          console.log("[BatchCollect] Status running değil:", currentProgress.status);
          break;
        }

        // Sıradaki pending item'ı bul
        const nextIndex = currentProgress.items.findIndex(
          (item) => item.status === "pending"
        );

        // Tüm item'lar işlendi
        if (nextIndex === -1) {
          console.log("[BatchCollect] Tüm item'lar işlendi ✓");
          updateProgressSync((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: "completed",
              completedAt: new Date()
            };
          });
          queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() });
          break;
        }

        const item = currentProgress.items[nextIndex];
        console.log(
          `[BatchCollect] İşleniyor [${nextIndex + 1}/${currentProgress.totalCount}]`,
          {
            invoiceNo: item.invoice.invoiceNumber,
            customerId: item.invoice.customerId,
            amount: item.invoice.grandTotal
          }
        );

        // 0 TL veya negatif tutar kontrolü
        if (item.invoice.grandTotal <= 0) {
          console.log(
            `[BatchCollect] ATLANDI [${nextIndex + 1}/${currentProgress.totalCount}] - Geçersiz tutar`,
            { invoiceNo: item.invoice.invoiceNumber, amount: item.invoice.grandTotal }
          );

          updateProgressSync((prev) =>
            applyItemResult(prev, {
              index: nextIndex,
              status: "error",
              error: "Tahsilat tutarı 0 TL veya negatif olamaz"
            })
          );

          // Döngü devam eder, rekürsif çağrı yok
          continue;
        }

        // Item durumunu "processing" olarak güncelle
        updateProgressSync((prev) => {
          if (!prev) return null;
          const newItems = [...prev.items];
          newItems[nextIndex] = { ...newItems[nextIndex], status: "processing" };
          return {
            ...prev,
            items: newItems,
            currentIndex: nextIndex
          };
        });

        // API çağrısı
        try {
          const result = await collectPayment({
            customerId: item.invoice.customerId,
            amount: item.invoice.grandTotal,
            mode: "custom",
            invoiceNo: item.invoice.invoiceNumber
          });

          if (!result.success) {
            console.log(
              `[BatchCollect] HATA [${nextIndex + 1}/${currentProgress.totalCount}]`,
              {
                invoiceNo: item.invoice.invoiceNumber,
                error: result.paymentError || result.message
              }
            );

            updateProgressSync((prev) =>
              applyItemResult(prev, {
                index: nextIndex,
                status: "error",
                error: result.paymentError || result.message
              })
            );
          } else {
            console.log(
              `[BatchCollect] BAŞARILI [${nextIndex + 1}/${currentProgress.totalCount}]`,
              { invoiceNo: item.invoice.invoiceNumber }
            );

            updateProgressSync((prev) =>
              applyItemResult(prev, {
                index: nextIndex,
                status: "completed"
              })
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Bilinmeyen hata";
          console.error(
            `[BatchCollect] EXCEPTION [${nextIndex + 1}/${currentProgress.totalCount}]`,
            { invoiceNo: item.invoice.invoiceNumber, error: errorMessage }
          );

          updateProgressSync((prev) =>
            applyItemResult(prev, {
              index: nextIndex,
              status: "error",
              error: errorMessage
            })
          );
        }

        // Döngü devam eder
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [queryClient, updateProgressSync]);

  const startBatchCollect = useCallback(
    (invoices: Invoice[]) => {
      if (invoices.length === 0) return;

      isPausedRef.current = false;
      isCancelledRef.current = false;
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

      // Ref'i ve state'i senkron güncelle, ardından döngüyü başlat
      progressRef.current = initialProgress;
      setProgress(initialProgress);

      // Döngüyü bir sonraki tick'te başlat (state'in yerleşmesi için)
      setTimeout(() => {
        runBatchLoop();
      }, 0);
    },
    [runBatchLoop]
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
      return { ...prev, status: "running" };
    });

    // Döngüyü yeniden başlat
    setTimeout(() => {
      runBatchLoop();
    }, 0);
  }, [runBatchLoop, updateProgress]);

  const cancelBatchCollect = useCallback(() => {
    isPausedRef.current = true;
    isCancelledRef.current = true;
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
    isCancelledRef.current = true;
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
