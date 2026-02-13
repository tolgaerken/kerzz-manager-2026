import { apiPost } from "../../../lib/apiClient";
import { E_DOC_STATUSES_CONSTANTS } from "../constants";
import type {
  IntegratorStatusItem,
  IntegratorStatusQueryParams,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = E_DOC_STATUSES_CONSTANTS;

export async function fetchIntegratorStatuses(
  params: IntegratorStatusQueryParams,
): Promise<IntegratorStatusItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.INTEGRATOR_STATUSES}`;

  return apiPost<IntegratorStatusItem[]>(url, {
    startDate: params.startDate,
    endDate: params.endDate,
  });
}
