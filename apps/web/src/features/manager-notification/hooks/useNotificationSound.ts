import { useState, useCallback, useEffect } from "react";
import { playNotificationSound, warmupAudioContext } from "../utils";

const STORAGE_KEY = "manager-notification-sound-enabled";

function getStoredPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Varsayılan: açık
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function setStoredPreference(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // localStorage erişilemezse sessizce devam et
  }
}

/**
 * Bildirim sesi yönetim hook'u.
 *
 * - localStorage'da ses tercihi saklar
 * - Ses açma/kapama toggle fonksiyonu sağlar
 * - Toggle tıklamasında AudioContext'i warmup eder (Safari uyumluluğu)
 * - Yeni bildirim geldiğinde ses çalma fonksiyonu sağlar
 */
export function useNotificationSound() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(getStoredPreference);

  // localStorage ile senkronize tut
  useEffect(() => {
    setStoredPreference(isSoundEnabled);
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    // Kullanıcı etkileşimi (click) sırasında AudioContext'i başlat.
    // Safari, AudioContext'in user gesture içinde oluşturulmasını gerektirir.
    warmupAudioContext();

    setIsSoundEnabled((prev) => !prev);
  }, []);

  const playSound = useCallback(() => {
    if (isSoundEnabled) {
      playNotificationSound();
    }
  }, [isSoundEnabled]);

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
  } as const;
}
