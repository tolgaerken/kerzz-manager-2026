import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkContract } from "../api";
import { CONTRACTS_QUERY_KEY } from "./useContracts";
import type {
  Contract,
  BatchCheckProgress,
  BatchCheckItem,
  BatchCheckContextValue
} from "../types";

function generateId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useBatchCheckContracts(): BatchCheckContextValue {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BatchCheckProgress | null>(null);
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

  const processNextItem = useCallback(async (currentProgress: BatchCheckProgress) => {
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
      queryClient.invalidateQueries({ queryKey: [CONTRACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["contract-payments"] });
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
      const result = await checkContract(item.contractId);

      setProgress((prev) => {
        if (!prev) return null;
        const newItems = [...prev.items];
        newItems[nextIndex] = {
          ...newItems[nextIndex],
          status: "completed",
          result
        };
        
        // Calculate counts from items array
        const completedCount = newItems.filter(
          (i) => i.status === "completed" || i.status === "error"
        ).length;
        const errorCount = newItems.filter((i) => i.status === "error").length;
        
        const newProgress: BatchCheckProgress = {
          ...prev,
          items: newItems,
          completedCount,
          errorCount
        };

        // Process next item
        setTimeout(() => processNextItem(newProgress), 100);

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
        
        // Calculate counts from items array
        const completedCount = newItems.filter(
          (i) => i.status === "completed" || i.status === "error"
        ).length;
        const errorCount = newItems.filter((i) => i.status === "error").length;
        
        const newProgress: BatchCheckProgress = {
          ...prev,
          items: newItems,
          completedCount,
          errorCount
        };

        // Continue with next item even on error
        setTimeout(() => processNextItem(newProgress), 100);

        return newProgress;
      });
    }
  }, [queryClient]);

  const startBatchCheck = useCallback((contracts: Contract[]) => {
    if (contracts.length === 0) return;

    isPausedRef.current = false;
    abortControllerRef.current = new AbortController();

    const items: BatchCheckItem[] = contracts.map((contract) => ({
      contractId: contract.id,
      contract,
      status: "pending"
    }));

    const newProgress: BatchCheckProgress = {
      id: generateId(),
      status: "running",
      items,
      currentIndex: 0,
      totalCount: contracts.length,
      completedCount: 0,
      errorCount: 0,
      startedAt: new Date(),
      isMinimized: false
    };

    setProgress(newProgress);

    // Start processing
    setTimeout(() => processNextItem(newProgress), 100);
  }, [processNextItem]);

  const pauseBatchCheck = useCallback(() => {
    isPausedRef.current = true;
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, status: "paused" };
    });
  }, []);

  const resumeBatchCheck = useCallback(() => {
    isPausedRef.current = false;
    setProgress((prev) => {
      if (!prev) return null;
      const newProgress = { ...prev, status: "running" as const };
      setTimeout(() => processNextItem(newProgress), 100);
      return newProgress;
    });
  }, [processNextItem]);

  const cancelBatchCheck = useCallback(() => {
    isPausedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setProgress(null);
  }, []);

  const minimizeBatchCheck = useCallback(() => {
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: true };
    });
  }, []);

  const maximizeBatchCheck = useCallback(() => {
    setProgress((prev) => {
      if (!prev) return null;
      return { ...prev, isMinimized: false };
    });
  }, []);

  const clearBatchCheck = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    progress,
    startBatchCheck,
    pauseBatchCheck,
    resumeBatchCheck,
    cancelBatchCheck,
    minimizeBatchCheck,
    maximizeBatchCheck,
    clearBatchCheck
  };
}
