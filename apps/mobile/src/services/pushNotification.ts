/**
 * Push notification service using Firebase Cloud Messaging
 */

import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";
import { authStorage } from "../lib/secureStorage";
import { apiClient } from "../lib/apiClient";

export interface PushNotificationPayload {
  notificationId?: string;
  entityType?: "customer" | "contract" | "license" | "notification";
  entityId?: string;
  title?: string;
  body?: string;
}

type NotificationHandler = (payload: PushNotificationPayload) => void;

class PushNotificationService {
  private onNotificationOpenedHandler: NotificationHandler | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnNotificationOpened: (() => void) | null = null;

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      } else {
        // Android 13+ requires runtime permission
        if (typeof Platform.Version === "number" && Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
    } catch (error) {
      console.error("Push permission request error:", error);
      return false;
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async registerDevice(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("Push notifications not permitted");
        return null;
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      // Store token locally
      await authStorage.setDeviceToken(token);

      // Register token with backend
      await this.sendTokenToBackend(token);

      return token;
    } catch (error) {
      console.error("Device registration error:", error);
      return null;
    }
  }

  /**
   * Send FCM token to backend for push notification targeting
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiClient.post("/device-tokens", {
        token,
        platform: Platform.OS,
        deviceId: Platform.OS === "ios" ? "ios-device" : "android-device",
      });
    } catch (error) {
      // Token registration endpoint may not exist yet
      console.log("Token registration skipped (endpoint may not exist):", error);
    }
  }

  /**
   * Set up notification listeners
   */
  setupListeners(onNotificationOpened: NotificationHandler): void {
    this.onNotificationOpenedHandler = onNotificationOpened;

    // Handle notification when app is in foreground
    this.unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log("Foreground notification:", remoteMessage);
        // Could show local notification here
      }
    );

    // Handle notification opened when app is in background
    this.unsubscribeOnNotificationOpened =
      messaging().onNotificationOpenedApp(
        (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log("Notification opened from background:", remoteMessage);
          const payload = this.parsePayload(remoteMessage);
          this.onNotificationOpenedHandler?.(payload);
        }
      );

    // Check if app was opened from a notification (quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log("Notification opened from quit state:", remoteMessage);
          const payload = this.parsePayload(remoteMessage);
          this.onNotificationOpenedHandler?.(payload);
        }
      });

    // Listen for token refresh
    messaging().onTokenRefresh(async (token: string) => {
      console.log("FCM Token refreshed:", token);
      await authStorage.setDeviceToken(token);
      await this.sendTokenToBackend(token);
    });
  }

  /**
   * Parse notification payload
   */
  private parsePayload(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): PushNotificationPayload {
    const data = remoteMessage.data || {};
    return {
      notificationId: data.notificationId as string | undefined,
      entityType: data.entityType as PushNotificationPayload["entityType"],
      entityId: data.entityId as string | undefined,
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
    };
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    this.unsubscribeOnMessage?.();
    this.unsubscribeOnNotificationOpened?.();
    this.onNotificationOpenedHandler = null;
  }

  /**
   * Unregister device (on logout)
   */
  async unregisterDevice(): Promise<void> {
    try {
      const token = await authStorage.getDeviceToken();
      if (token) {
        await apiClient.delete(`/device-tokens/${token}`);
        await authStorage.removeDeviceToken();
      }
    } catch (error) {
      console.log("Device unregistration error:", error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
