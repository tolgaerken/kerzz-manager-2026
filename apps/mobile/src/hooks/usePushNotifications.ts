/**
 * Hook for managing push notifications
 * Uses navigationRef instead of useNavigation so it can work
 * regardless of NavigationContainer mounting order.
 */

import { useEffect, useCallback } from "react";
import {
  pushNotificationService,
  PushNotificationPayload,
} from "../services/pushNotification";
import { useAuthStore } from "../store/authStore";
import { navigationRef } from "../navigation/navigationRef";

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleNotificationOpened = useCallback(
    (payload: PushNotificationPayload) => {
      console.log("Handling notification:", payload);

      if (!isAuthenticated || !navigationRef.isReady()) {
        return;
      }

      if (payload.notificationId) {
        navigationRef.navigate("NotificationDetail", {
          notificationId: payload.notificationId,
        });
      } else if (payload.entityType && payload.entityId) {
        switch (payload.entityType) {
          case "customer":
            navigationRef.navigate("CustomerDetail", {
              customerId: payload.entityId,
            });
            break;
          case "notification":
            navigationRef.navigate("NotificationDetail", {
              notificationId: payload.entityId,
            });
            break;
          default:
            console.log("Unknown entity type:", payload.entityType);
        }
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated) {
      pushNotificationService.registerDevice();
      pushNotificationService.setupListeners(handleNotificationOpened);
    }

    return () => {
      pushNotificationService.cleanup();
    };
  }, [isAuthenticated, handleNotificationOpened]);

  return {
    registerDevice: pushNotificationService.registerDevice.bind(
      pushNotificationService
    ),
    unregisterDevice: pushNotificationService.unregisterDevice.bind(
      pushNotificationService
    ),
  };
}
