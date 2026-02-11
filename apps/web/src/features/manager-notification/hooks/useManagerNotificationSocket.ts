import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMongoChangeStream } from "../../../hooks/useMongoChangeStream";
import type { MongoChangeEvent } from "../../../hooks/useMongoChangeStream";
import { managerNotificationKeys } from "../api";

interface UseManagerNotificationSocketOptions {
  /** Yeni bildirim geldiğinde çağrılacak callback (ör: ses çalma) */
  onNewNotification?: () => void;
}

/**
 * Manager notification'lar için WebSocket dinleyicisi.
 *
 * Mevcut useMongoChangeStream altyapısını kullanarak
 * "manager-notifications" collection'ını dinler ve
 * cache'i otomatik günceller.
 *
 * @param userId - Mevcut kullanıcı ID'si
 * @param options - Opsiyonel ayarlar (ör: onNewNotification callback)
 */
export function useManagerNotificationSocket(
  userId: string | null,
  options?: UseManagerNotificationSocketOptions
) {
  const queryClient = useQueryClient();

  const handleChange = useCallback(
    (event: MongoChangeEvent) => {
      if (!userId) return;

      // insert → yeni bildirim geldi
      // update → okundu olarak işaretlendi
      // delete → bildirim silindi
      const isRelevant =
        event.operationType === "insert" ||
        event.operationType === "update" ||
        event.operationType === "delete";

      if (!isRelevant) return;

      // insert durumunda: fullDocument varsa userId kontrolü yap
      // Eğer fullDocument yoksa veya userId eşleşiyorsa cache'i güncelle
      if (
        event.operationType === "insert" &&
        event.fullDocument &&
        event.fullDocument.userId !== userId
      ) {
        return;
      }

      // Bildirim listesini yenile
      queryClient.invalidateQueries({
        queryKey: managerNotificationKeys.lists(),
      });

      // Okunmamış sayısını yenile
      queryClient.invalidateQueries({
        queryKey: managerNotificationKeys.unreadCount(userId),
      });

      // Yeni bildirim geldiğinde callback'i çağır (ses çalma vb.)
      if (event.operationType === "insert" && options?.onNewNotification) {
        options.onNewNotification();
      }
    },
    [userId, queryClient, options]
  );

  useMongoChangeStream(
    userId ? "manager-notifications" : null,
    handleChange
  );
}
