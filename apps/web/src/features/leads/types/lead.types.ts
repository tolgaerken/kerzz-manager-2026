export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | "lost";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export interface LeadActivity {
  description: string;
  userId: string;
  userName: string;
  date: string;
  type: string;
}

export interface LeadLossInfo {
  reason?: "price" | "competitor" | "timing" | "no-budget" | "no-response" | "other";
  competitor?: string;
  notes?: string;
  lostAt?: string;
  lostBy?: string;
}

export interface LeadStageHistory {
  fromStatus: LeadStatus;
  toStatus: LeadStatus;
  changedBy?: string;
  changedAt: string;
  durationInStage: number;
}

export interface Lead {
  _id: string;
  pipelineRef: string;
  customerId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  companyName: string;
  source: string;
  assignedUserId: string;
  assignedUserName: string;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string;
  estimatedValue: number;
  currency: string;
  expectedCloseDate: string;
  labels: string[];
  activities: LeadActivity[];
  lossInfo?: LeadLossInfo;
  stageHistory?: LeadStageHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus | "all";
  priority?: LeadPriority | "all";
  assignedUserId?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeadsResponse {
  data: Lead[];
  meta: PaginationMeta;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  unqualified: number;
  converted: number;
  lost: number;
  openValue: number;
  weightedValue: number;
}

export interface CreateLeadInput {
  customerId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  companyName?: string;
  source?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  notes?: string;
  estimatedValue?: number;
  currency?: string;
  expectedCloseDate?: string;
  labels?: string[];
  lossInfo?: LeadLossInfo;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {}

export interface AddActivityInput {
  description: string;
  userId?: string;
  userName?: string;
  type?: string;
}
