import { useEffect, useRef } from "react";
import { useSocket } from "../providers/SocketProvider";

/** Backend'den gelen degisiklik olayi. */
export interface MongoChangeEvent {
  collection: string;
  operationType: "insert" | "update" | "replace" | "delete";
  documentId: string;
  updatedFields?: Record<string, unknown>;
  fullDocument?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Belirtilen MongoDB collection icin change stream dinler.
 *
 * Kullanim:
 * ```ts
 * useMongoChangeStream("contract-payments", (event) => {
 *   if (event.fullDocument?.companyId === selectedErpId) {
 *     queryClient.invalidateQueries({ queryKey: ... });
 *   }
 * });
 * ```
 *
 * Component unmount olunca otomatik unsubscribe olur.
 * Collection null/undefined ise dinleme yapilmaz.
 */
export function useMongoChangeStream(
  collection: string | null | undefined,
  onEvent: (event: MongoChangeEvent) => void
): void {
  const { socket } = useSocket();
  const callbackRef = useRef(onEvent);

  // Her zaman en guncel callback'i tut (yeniden subscribe gerektirmez)
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!socket || !collection) return;

    // Collection room'una abone ol
    console.log(`[useMongoChangeStream] Subscribe: "${collection}"`);
    socket.emit("subscribe", { collection });

    const handler = (event: MongoChangeEvent) => {
      if (event.collection === collection) {
        console.log(
          `[useMongoChangeStream] Event alindi: ${collection} [${event.operationType}] doc=${event.documentId}`,
          event.updatedFields ? `alanlar: ${Object.keys(event.updatedFields).join(", ")}` : ""
        );
        callbackRef.current(event);
      }
    };

    socket.on("change", handler);

    return () => {
      console.log(`[useMongoChangeStream] Unsubscribe: "${collection}"`);
      socket.off("change", handler);
      socket.emit("unsubscribe", { collection });
    };
  }, [socket, collection]);
}
