import { apiGet } from "../../../lib/apiClient";
import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type { CronName, CronDryRunResponse } from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

export const cronDryRunApi = {
  async run(cronName: CronName): Promise<CronDryRunResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.CRON_DRY_RUN}/${cronName}/dry-run`;
    return apiGet<CronDryRunResponse>(url);
  },
};
