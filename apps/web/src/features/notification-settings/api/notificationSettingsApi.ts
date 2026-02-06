import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  NotificationSettings,
  UpdateNotificationSettingsDto,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

export const notificationSettingsApi = {
  async get(): Promise<NotificationSettings> {
    const url = `${API_BASE_URL}${ENDPOINTS.SETTINGS}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<NotificationSettings>(response);
  },

  async update(dto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const url = `${API_BASE_URL}${ENDPOINTS.SETTINGS}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dto),
    });

    return handleResponse<NotificationSettings>(response);
  },
};
