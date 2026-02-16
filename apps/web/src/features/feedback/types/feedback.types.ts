export type FeedbackStatus = "open" | "in_progress" | "completed" | "rejected";
export type FeedbackPriority = "low" | "medium" | "high" | "urgent";

export interface Feedback {
  _id: string;
  id: string;
  title: string;
  description: string;
  screenshots: string[];
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: FeedbackStatus | "all";
  priority?: FeedbackPriority | "all";
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FeedbacksResponse {
  data: Feedback[];
  meta: PaginationMeta;
}

export interface CreateFeedbackInput {
  title: string;
  description: string;
  screenshots?: string[];
  priority?: FeedbackPriority;
}

export interface UpdateFeedbackInput {
  title?: string;
  description?: string;
  screenshots?: string[];
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
}

// Status ve Priority için label ve renk mapping'leri
export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "Açık",
  in_progress: "İşleniyor",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

export const PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
};
