import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMongoChangeStream } from "../../../hooks/useMongoChangeStream";
import type { MongoChangeEvent } from "../../../hooks/useMongoChangeStream";
import { SALES_CONSTANTS } from "../constants/sales.constants";

const { QUERY_KEYS } = SALES_CONSTANTS;

interface UseSalesSocketOptions {
  /** Satış değişikliği olduğunda çağrılacak callback */
  onSaleChange?: (event: MongoChangeEvent) => void;
  /** Socket dinlemeyi aktif/pasif yapar */
  enabled?: boolean;
}

/**
 * Sales collection için WebSocket dinleyicisi.
 *
 * MongoDB change stream'i dinleyerek satış verilerinde
 * değişiklik olduğunda React Query cache'ini otomatik günceller.
 *
 * Kullanım:
 * ```ts
 * useSalesSocket({
 *   onSaleChange: (event) => {
 *     console.log("Satış değişti:", event.documentId);
 *   }
 * });
 * ```
 */
export function useSalesSocket(options?: UseSalesSocketOptions) {
  const queryClient = useQueryClient();
  const { onSaleChange, enabled = true } = options || {};

  const handleChange = useCallback(
    (event: MongoChangeEvent) => {
      // Tüm satış değişikliklerinde cache'i güncelle
      const isRelevant =
        event.operationType === "insert" ||
        event.operationType === "update" ||
        event.operationType === "delete";

      if (!isRelevant) return;

      // Satış listesini yenile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SALES],
      });

      // İstatistikleri yenile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SALE_STATS],
      });

      // Bekleyen onayları yenile
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PENDING_APPROVALS],
      });

      // Eğer update ise ve documentId varsa, tekil satışı da yenile
      if (event.operationType === "update" && event.documentId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.SALE, event.documentId],
        });
      }

      // Callback varsa çağır
      onSaleChange?.(event);
    },
    [queryClient, onSaleChange]
  );

  useMongoChangeStream(enabled ? "sales" : null, handleChange);
}
