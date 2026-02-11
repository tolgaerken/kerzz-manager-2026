import { apiGet, apiPut } from "../../../lib/apiClient";
import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  NotificationSettings,
  UpdateNotificationSettingsDto,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

export const notificationSettingsApi = {
  async get(): Promise<NotificationSettings> {
    const url = `${API_BASE_URL}${ENDPOINTS.SETTINGS}`;

    return apiGet<NotificationSettings>(url);
  },

  async update(dto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const url = `${API_BASE_URL}${ENDPOINTS.SETTINGS}`;

    return apiPut<NotificationSettings>(url, dto);
  },
};
