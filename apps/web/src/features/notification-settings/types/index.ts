// ==================== NOTIFICATION TEMPLATE TYPES ====================

export type NotificationChannel = "email" | "sms";

export interface NotificationTemplate {
  _id: string;
  id: string;
  name: string;
  code: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  isActive: boolean;
  variables: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplateQueryParams {
  channel?: NotificationChannel;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationTemplatesResponse {
  data: NotificationTemplate[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNotificationTemplateDto {
  name: string;
  code: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  isActive?: boolean;
  variables?: string[];
  description?: string;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
  variables?: string[];
  description?: string;
}

export interface RenderTemplateResponse {
  subject?: string;
  body: string;
}

// ==================== NOTIFICATION SETTINGS TYPES ====================

export interface NotificationSettings {
  _id: string;
  id: string;
  invoiceDueReminderDays: number[];
  invoiceOverdueDays: number[];
  invoiceLookbackDays: number;
  contractExpiryDays: number[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  cronTime: string;
  cronEnabled: boolean;
  invoiceNotificationCronEnabled: boolean;
  contractNotificationCronEnabled: boolean;
  proratedInvoiceCronEnabled: boolean;
  stalePipelineCronEnabled: boolean;
  managerLogReminderCronEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsDto {
  invoiceDueReminderDays?: number[];
  invoiceOverdueDays?: number[];
  invoiceLookbackDays?: number;
  contractExpiryDays?: number[];
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  cronTime?: string;
  cronEnabled?: boolean;
  invoiceNotificationCronEnabled?: boolean;
  contractNotificationCronEnabled?: boolean;
  proratedInvoiceCronEnabled?: boolean;
  stalePipelineCronEnabled?: boolean;
  managerLogReminderCronEnabled?: boolean;
}

// ==================== NOTIFICATION LOG TYPES ====================

export type NotificationLogStatus = "sent" | "failed";
export type NotificationLogContextType = "invoice" | "contract";

export interface NotificationLog {
  _id: string;
  id: string;
  templateCode: string;
  channel: NotificationChannel;
  recipientEmail: string;
  recipientPhone: string;
  recipientName: string;
  contextType: NotificationLogContextType;
  contextId: string;
  customerId: string;
  invoiceId: string;
  contractId: string;
  status: NotificationLogStatus;
  errorMessage: string;
  messageId: string;
  responseData: Record<string, unknown>;
  templateData: Record<string, unknown>;
  renderedSubject: string;
  renderedBody: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogQueryParams {
  channel?: NotificationChannel;
  status?: NotificationLogStatus;
  contextType?: NotificationLogContextType;
  contextId?: string;
  customerId?: string;
  invoiceId?: string;
  contractId?: string;
  templateCode?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationLogsResponse {
  data: NotificationLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    sent: number;
    failed: number;
    byChannel: Record<string, number>;
  };
}

// ==================== NOTIFICATION QUEUE TYPES ====================

export interface QueueCustomer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

export interface QueueInvoiceItem {
  _id: string;
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  dueDate: string;
  overdueDays: number;
  status: "due" | "overdue";
  lastNotify: string | null;
  notifyCount: number;
  customer: QueueCustomer;
}

export interface QueueContractItem {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  endDate: string;
  remainingDays: number;
  customer: QueueCustomer;
}

export interface InvoiceQueueQueryParams {
  type?: "due" | "overdue" | "all";
  overdueDaysMin?: number;
  overdueDaysMax?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ContractQueueQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedQueueInvoicesResponse {
  data: QueueInvoiceItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedQueueContractsResponse {
  data: QueueContractItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueueStats {
  pendingInvoices: number;
  overdueInvoices: number;
  dueInvoices: number;
  pendingContracts: number;
}

export interface ManualSendItem {
  type: "invoice" | "contract";
  id: string;
}

export interface ManualSendDto {
  items: ManualSendItem[];
  channels: ("email" | "sms")[];
}

export interface ManualSendResultItem {
  type: "invoice" | "contract";
  id: string;
  channel: "email" | "sms";
  success: boolean;
  error?: string;
}

export interface ManualSendResponse {
  sent: number;
  failed: number;
  results: ManualSendResultItem[];
}

export interface QueuePreviewParams {
  type: "invoice" | "contract";
  id: string;
  channel: "email" | "sms";
}

export interface QueuePreviewResponse {
  subject?: string;
  body: string;
  templateCode: string;
  recipient: {
    name: string;
    email: string;
    phone: string;
  };
}
