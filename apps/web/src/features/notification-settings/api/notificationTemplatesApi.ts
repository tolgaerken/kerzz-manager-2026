import { NOTIFICATION_SETTINGS_CONSTANTS } from "../constants/notification-settings.constants";
import type {
  NotificationTemplate,
  NotificationTemplateQueryParams,
  PaginatedNotificationTemplatesResponse,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
  RenderTemplateResponse,
} from "../types";

const { API_BASE_URL, ENDPOINTS } = NOTIFICATION_SETTINGS_CONSTANTS;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
    throw new Error(error.message || "Sunucu Hatası");
  }
  return response.json();
}

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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<PaginatedNotificationTemplatesResponse>(response);
  },

  async getById(id: string): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<NotificationTemplate>(response);
  },

  async getByCode(code: string): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/code/${code}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<NotificationTemplate>(response);
  },

  async create(dto: CreateNotificationTemplateDto): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dto),
    });

    return handleResponse<NotificationTemplate>(response);
  },

  async update(
    id: string,
    dto: UpdateNotificationTemplateDto
  ): Promise<NotificationTemplate> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(dto),
    });

    return handleResponse<NotificationTemplate>(response);
  },

  async delete(id: string): Promise<void> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Sunucu Hatası" }));
      throw new Error(error.message || "Sunucu Hatası");
    }
  },

  async render(
    code: string,
    data?: Record<string, unknown>
  ): Promise<RenderTemplateResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/render`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code, data }),
    });

    return handleResponse<RenderTemplateResponse>(response);
  },

  async preview(code: string): Promise<RenderTemplateResponse> {
    const url = `${API_BASE_URL}${ENDPOINTS.TEMPLATES}/preview/${code}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return handleResponse<RenderTemplateResponse>(response);
  },
};
