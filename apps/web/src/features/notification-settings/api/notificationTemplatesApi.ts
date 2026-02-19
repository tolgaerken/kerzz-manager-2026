import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  NotificationTemplate,
  NotificationTemplateQueryParams,
  PaginatedNotificationTemplatesResponse,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  RenderTemplateResponse,
  SendTemplateTestEmailDto,
  SendTemplateTestEmailResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

function buildQueryString(params?: NotificationTemplateQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  if (params.channel) searchParams.set("channel", params.channel);
  if (params.isActive !== undefined) searchParams.set("isActive", params.isActive.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
}

export const notificationTemplatesApi = {
  async getAll(
    params?: NotificationTemplateQueryParams
  ): Promise<PaginatedNotificationTemplatesResponse> {
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}${queryString ? `?${queryString}` : ""}`;

    return apiGet<PaginatedNotificationTemplatesResponse>(url);
  },

  async getById(id: string): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    return apiGet<NotificationTemplate>(url);
  },

  async getByCode(code: string): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/code/${code}`;

    return apiGet<NotificationTemplate>(url);
  },

  async create(dto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}`;

    return apiPost<NotificationTemplate>(url, dto);
  },

  async update(
    id: string,
    dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    return apiPut<NotificationTemplate>(url, dto);
  },

  async delete(id: string): Promise<void> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    return apiDelete<void>(url);
  },

  async render(
    code: string,
    data?: Record<string, unknown>
  ): Promise<RenderTemplateResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/render`;

    return apiPost<RenderTemplateResponse>(url, { code, data });
  },

  async preview(code: string): Promise<RenderTemplateResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/preview/${code}`;

    return apiGet<RenderTemplateResponse>(url);
  },

  async sendTestEmail(
    code: string,
    dto: SendTemplateTestEmailDto
  ): Promise<SendTemplateTestEmailResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/preview/${code}/send-test`;

    return apiPost<SendTemplateTestEmailResponse>(url, dto);
  },
};
