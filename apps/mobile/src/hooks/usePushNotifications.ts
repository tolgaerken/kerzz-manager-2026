/**
 * Hook for managing push notifications
 */

import { useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  pushNotificationService,
  PushNotificationPayload,
} from "../services/pushNotification";
import { useAuthStore } from "../store/authStore";
import type { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function usePushNotifications() {
  const navigation = useNavigation<NavigationProp>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleNotificationOpened = useCallback(
    (payload: PushNotificationPayload) => {
      console.log("Handling notification:", payload);

      if (!isAuthenticated) {
        // Store pending navigation for after login
        return;
      }

      // Navigate based on payload
      if (payload.notificationId) {
        navigation.navigate("NotificationDetail", {
          notificationId: payload.notificationId,
        });
      } else if (payload.entityType && payload.entityId) {
        switch (payload.entityType) {
          case "customer":
            navigation.navigate("CustomerDetail", {
              customerId: payload.entityId,
            });
            break;
          case "notification":
            navigation.navigate("NotificationDetail", {
              notificationId: payload.entityId,
            });
            break;
          // Add more entity types as needed
          default:
            console.log("Unknown entity type:", payload.entityType);
        }
      }
    },
    [navigation, isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated) {
      // Register device and set up listeners when authenticated
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
