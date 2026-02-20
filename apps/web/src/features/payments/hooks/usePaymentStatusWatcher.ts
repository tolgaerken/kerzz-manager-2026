import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../../../providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { paymentsKeys } from "./usePayments";

interface MongoChangeEvent {
  collection: string;
  operationType: "insert" | "update" | "replace" | "delete";
  documentId: string;
  updatedFields?: Record<string, unknown>;
  fullDocument?: Record<string, unknown>;
  timestamp: string;
}

export type PaymentWatchStatus =
  | "idle"
  | "connecting"
  | "watching"
  | "success"
  | "failed"
  | "timeout";

interface PaymentWatchResult {
  status: PaymentWatchStatus;
  paymentStatus: string | null;
  statusMessage: string | null;
  error: string | null;
}

interface UsePaymentStatusWatcherOptions {
  documentId: string | null;
  initialStatus?: string;
  timeoutMs?: number;
  enabled?: boolean;
}

export function usePaymentStatusWatcher({
  documentId,
  initialStatus,
  timeoutMs = 60_000,
  enabled = true,
}: UsePaymentStatusWatcherOptions): PaymentWatchResult {
  const { socket, status: socketStatus } = useSocket();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<PaymentWatchResult>({
    status: "idle",
    paymentStatus: initialStatus ?? null,
    statusMessage: null,
    error: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribedRef = useRef(false);

  const clearTimeoutIfExists = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !documentId) {
      return;
    }

    if (initialStatus === "success") {
      setResult({
        status: "success",
        paymentStatus: "success",
        statusMessage: null,
        error: null,
      });
      return;
    }

    if (initialStatus === "failed") {
      setResult({
        status: "failed",
        paymentStatus: "failed",
        statusMessage: null,
        error: null,
      });
      return;
    }

    if (socketStatus === "disconnected") {
      setResult((prev) => ({ ...prev, status: "connecting" }));
      return;
    }

    if (!socket || socketStatus !== "connected") {
      setResult((prev) => ({ ...prev, status: "connecting" }));
      return;
    }

    setResult((prev) => ({ ...prev, status: "watching" }));

    const handleChange = (event: MongoChangeEvent) => {
      if (event.collection !== "online-payments") {
        return;
      }

      const eventDocId = event.documentId;
      const fullDoc = event.fullDocument;
      const updatedFields = event.updatedFields;

      const docIdMatches =
        eventDocId === documentId ||
        fullDoc?.linkId === documentId ||
        fullDoc?.id === documentId ||
        fullDoc?._id === documentId;

      if (!docIdMatches) {
        return;
      }

      const newStatus =
        (updatedFields?.status as string) ??
        (fullDoc?.status as string) ??
        null;

      if (!newStatus) {
        return;
      }

      clearTimeoutIfExists();

      const statusMessage =
        (updatedFields?.statusMessage as string) ??
        (fullDoc?.statusMessage as string) ??
        null;

      if (newStatus === "success") {
        setResult({
          status: "success",
          paymentStatus: "success",
          statusMessage,
          error: null,
        });
      } else if (newStatus === "failed") {
        setResult({
          status: "failed",
          paymentStatus: "failed",
          statusMessage,
          error: statusMessage,
        });
      }

      queryClient.invalidateQueries({
        queryKey: paymentsKeys.detail(documentId),
      });
    };

    if (!subscribedRef.current) {
      socket.emit("subscribe", { collection: "online-payments" });
      subscribedRef.current = true;
    }

    socket.on("change", handleChange);

    timeoutRef.current = setTimeout(() => {
      setResult((prev) => ({
        ...prev,
        status: "timeout",
        error: "Odeme durumu alinamadi. Lutfen daha sonra kontrol edin.",
      }));
    }, timeoutMs);

    return () => {
      socket.off("change", handleChange);
      clearTimeoutIfExists();
    };
  }, [
    socket,
    socketStatus,
    documentId,
    initialStatus,
    timeoutMs,
    enabled,
    clearTimeoutIfExists,
    queryClient,
  ]);

  useEffect(() => {
    return () => {
      if (socket && subscribedRef.current) {
        socket.emit("unsubscribe", { collection: "online-payments" });
        subscribedRef.current = false;
      }
      clearTimeoutIfExists();
    };
  }, [socket, clearTimeoutIfExists]);

  return result;
}
