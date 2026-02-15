/**
 * Secure storage wrapper using react-native-encrypted-storage
 * Provides Keychain (iOS) / Keystore (Android) based secure storage
 */

import EncryptedStorage from "react-native-encrypted-storage";
import { STORAGE_KEYS } from "@kerzz/shared";

export const secureStorage = {
  /**
   * Store a value securely
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error(`SecureStorage setItem error for ${key}:`, error);
      throw error;
    }
  },

  /**
   * Retrieve a value
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error(`SecureStorage getItem error for ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a value
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error(`SecureStorage removeItem error for ${key}:`, error);
    }
  },

  /**
   * Clear all stored values
   */
  clear: async (): Promise<void> => {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error("SecureStorage clear error:", error);
    }
  },

  /**
   * Store JSON object
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await secureStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Retrieve JSON object
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await secureStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },
};

// Convenience exports for common keys
export const authStorage = {
  getUserInfo: () =>
    secureStorage.getObject<import("@kerzz/shared").UserInfo>(
      STORAGE_KEYS.USER_INFO
    ),
  setUserInfo: (userInfo: import("@kerzz/shared").UserInfo) =>
    secureStorage.setObject(STORAGE_KEYS.USER_INFO, userInfo),
  removeUserInfo: () => secureStorage.removeItem(STORAGE_KEYS.USER_INFO),

  getActiveLicance: () =>
    secureStorage.getObject<import("@kerzz/shared").UserLicance>(
      STORAGE_KEYS.ACTIVE_LICANCE
    ),
  setActiveLicance: (licance: import("@kerzz/shared").UserLicance) =>
    secureStorage.setObject(STORAGE_KEYS.ACTIVE_LICANCE, licance),
  removeActiveLicance: () =>
    secureStorage.removeItem(STORAGE_KEYS.ACTIVE_LICANCE),

  getDeviceToken: () => secureStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN),
  setDeviceToken: (token: string) =>
    secureStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token),
  removeDeviceToken: () => secureStorage.removeItem(STORAGE_KEYS.DEVICE_TOKEN),
};
