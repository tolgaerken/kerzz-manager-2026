export interface LogMention {
  userId: string;
  userName: string;
}

export interface LogReference {
  type: string; // "contract" | "license" | ...
  id: string;
  label: string;
}

export interface LogReminder {
  date: string;
  completed: boolean;
}

export interface Log {
  _id: string;
  id: string;
  customerId: string;
  contextType: string;
  contextId: string;
  pipelineRef?: string;
  message: string;
  mentions: LogMention[];
  references: LogReference[];
  reminder: LogReminder | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogQueryParams {
  customerId?: string;
  contextType?: string;
  contextId?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  data: Log[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLogInput {
  customerId: string;
  contextType: string;
  contextId: string;
  pipelineRef?: string;
  message: string;
  mentions?: LogMention[];
  references?: LogReference[];
  reminder?: {
    date: string;
    completed?: boolean;
  };
  authorId: string;
  authorName: string;
}

export interface PipelineLogsResponse {
  pipelineRef: string;
  lead: Log[];
  offer: Log[];
  sale: Log[];
}

export interface LogPanelContext {
  customerId: string;
  contextType: string;
  contextId: string;
  title?: string;
}

export interface PipelineLogPanelContext {
  pipelineRef: string;
  customerId?: string;
  title?: string;
  // Hangi entity'den açıldığını belirler
  leadId?: string;
  offerId?: string;
  saleId?: string;
}
