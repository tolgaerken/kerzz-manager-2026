import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationQueueApi } from "../api";
import type { ManualSendItem, ManualSendResultItem } from "../types";

export interface BatchSendItem extends ManualSendItem {
  label: string;
}

export interface BatchSendProgress {
  status: "idle" | "running" | "paused" | "completed" | "cancelled";
  total: number;
  current: number;
  currentItem: BatchSendItem | null;
  sent: number;
  failed: number;
  results: ManualSendResultItem[];
}

const INITIAL_PROGRESS: BatchSendProgress = {
  status: "idle",
  total: 0,
  current: 0,
  currentItem: null,
  sent: 0,
  failed: 0,
  results: [],
};

export function useBatchSendNotification() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BatchSendProgress>(INITIAL_PROGRESS);
  const abortRef = useRef(false);
  const pauseRef = useRef(false);

  const startBatchSend = useCallback(
    async (items: BatchSendItem[], channels: ("email" | "sms")[]) => {
      if (items.length === 0) return;

      abortRef.current = false;
      pauseRef.current = false;

      setProgress({
        status: "running",
        total: items.length,
        current: 0,
        currentItem: null,
        sent: 0,
        failed: 0,
        results: [],
      });

      let sent = 0;
      let failed = 0;
      const allResults: ManualSendResultItem[] = [];

      for (let i = 0; i < items.length; i++) {
        if (abortRef.current) {
          setProgress((prev) => ({
            ...prev,
            status: "cancelled",
            currentItem: null,
          }));
          break;
        }

        while (pauseRef.current && !abortRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (abortRef.current) {
          setProgress((prev) => ({
            ...prev,
            status: "cancelled",
            currentItem: null,
          }));
          break;
        }

        const item = items[i];
        setProgress((prev) => ({
          ...prev,
          current: i + 1,
          currentItem: item,
        }));

        try {
          const response = await notificationQueueApi.sendManual({
            items: [{ type: item.type, id: item.id }],
            channels,
          });

          for (const result of response.results) {
            allResults.push(result);
            if (result.success) {
              sent++;
            } else {
              failed++;
            }
          }

          setProgress((prev) => ({
            ...prev,
            sent,
            failed,
            results: [...allResults],
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Bilinmeyen hata";
          
          for (const channel of channels) {
            allResults.push({
              type: item.type,
              id: item.id,
              channel,
              success: false,
              error: errorMessage,
            });
            failed++;
          }

          setProgress((prev) => ({
            ...prev,
            sent,
            failed,
            results: [...allResults],
          }));
        }
      }

      if (!abortRef.current) {
        setProgress((prev) => ({
          ...prev,
          status: "completed",
          currentItem: null,
        }));
      }

      queryClient.invalidateQueries({ queryKey: ["notification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["notification-logs"] });
    },
    [queryClient]
  );

  const pauseBatchSend = useCallback(() => {
    pauseRef.current = true;
    setProgress((prev) => ({ ...prev, status: "paused" }));
  }, []);

  const resumeBatchSend = useCallback(() => {
    pauseRef.current = false;
    setProgress((prev) => ({ ...prev, status: "running" }));
  }, []);

  const cancelBatchSend = useCallback(() => {
    abortRef.current = true;
    pauseRef.current = false;
  }, []);

  const clearBatchSend = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
  }, []);

  return {
    progress,
    startBatchSend,
    pauseBatchSend,
    resumeBatchSend,
    cancelBatchSend,
    clearBatchSend,
  };
}
