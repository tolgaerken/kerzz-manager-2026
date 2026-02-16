import { apiGet, apiPost, apiPatch, apiDelete } from "../../../lib/apiClient";
import { FEEDBACK_CONSTANTS } from "../constants/feedback.constants";
import type {
  FeedbacksResponse,
  FeedbackQueryParams,
  Feedback,
  CreateFeedbackInput,
  UpdateFeedbackInput,
} from "../types/feedback.types";

const { API_BASE_URL, ENDPOINTS } = FEEDBACK_CONSTANTS;

function buildQueryString(params: FeedbackQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.priority && params.priority !== "all") {
    searchParams.set("priority", params.priority);
  }
  if (params.sortField) {
    searchParams.set("sortField", params.sortField);
  }
  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  return searchParams.toString();
}

export async function fetchFeedbacks(
  params: FeedbackQueryParams = {},
): Promise<FeedbacksResponse> {
  const qs = buildQueryString(params);
  const url = `${API_BASE_URL}${ENDPOINTS.FEEDBACKS}${qs ? `?${qs}` : ""}`;

  return apiGet<FeedbacksResponse>(url);
}

export async function fetchFeedbackById(id: string): Promise<Feedback> {
  const url = `${API_BASE_URL}${ENDPOINTS.FEEDBACKS}/${encodeURIComponent(id)}`;

  return apiGet<Feedback>(url);
}

export async function createFeedback(
  input: CreateFeedbackInput,
): Promise<Feedback> {
  const url = `${API_BASE_URL}${ENDPOINTS.FEEDBACKS}`;

  return apiPost<Feedback>(url, input);
}

export async function updateFeedback(
  id: string,
  input: UpdateFeedbackInput,
): Promise<Feedback> {
  const url = `${API_BASE_URL}${ENDPOINTS.FEEDBACKS}/${encodeURIComponent(id)}`;

  return apiPatch<Feedback>(url, input);
}

export async function deleteFeedback(id: string): Promise<void> {
  const url = `${API_BASE_URL}${ENDPOINTS.FEEDBACKS}/${encodeURIComponent(id)}`;

  return apiDelete<void>(url);
}
