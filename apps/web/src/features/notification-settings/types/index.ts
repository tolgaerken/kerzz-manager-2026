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

export interface SendTemplateTestEmailDto {
  recipientEmail: string;
}

export interface SendTemplateTestEmailResponse {
  success: boolean;
  messageId?: string;
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
  // Job-bazlı enable/disable
  invoiceNotificationCronEnabled: boolean;
  monthlyContractNotificationCronEnabled: boolean;
  yearlyContractNotificationCronEnabled: boolean;
  proratedInvoiceCronEnabled: boolean;
  stalePipelineCronEnabled: boolean;
  managerLogReminderCronEnabled: boolean;
  // Job-bazlı zamanlama
  invoiceNotificationCronTime: string;
  monthlyContractNotificationCronTime: string;
  yearlyContractNotificationCronTime: string;
  proratedInvoiceCronTime: string;
  stalePipelineCronTime: string;
  managerLogReminderCronExpression: string;
  // Ödeme başarılı bildirim email adresleri
  paymentSuccessNotifyEmails: string[];
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
  // Job-bazlı enable/disable
  invoiceNotificationCronEnabled?: boolean;
  monthlyContractNotificationCronEnabled?: boolean;
  yearlyContractNotificationCronEnabled?: boolean;
  proratedInvoiceCronEnabled?: boolean;
  stalePipelineCronEnabled?: boolean;
  managerLogReminderCronEnabled?: boolean;
  // Job-bazlı zamanlama
  invoiceNotificationCronTime?: string;
  monthlyContractNotificationCronTime?: string;
  yearlyContractNotificationCronTime?: string;
  proratedInvoiceCronTime?: string;
  stalePipelineCronTime?: string;
  managerLogReminderCronExpression?: string;
  // Ödeme başarılı bildirim email adresleri
  paymentSuccessNotifyEmails?: string[];
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

export interface QueueContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface QueueCustomer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  contacts: QueueContact[];
}

export interface QueueNotifyUser {
  name: string;
  email: string;
  phone: string;
}

export interface QueueNotifyEntry {
  sms: boolean;
  email: boolean;
  sendTime: string | null;
  users: QueueNotifyUser[];
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
  notifyHistory: QueueNotifyEntry[];
  sentConditions: string[];
  customer: QueueCustomer;
}

export type ContractQueueType = "yearly" | "monthly" | "all";
export type ContractMilestone = "pre-expiry" | "post-1" | "post-3" | "post-5" | "all";

export interface QueueContractItem {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  endDate: string;
  remainingDays: number;
  sentConditions: string[];
  customer: QueueCustomer;
  yearly: boolean;
  milestone: ContractMilestone | null;
  renewalAmount?: number;
  oldAmount?: number;
  increaseRateInfo?: string;
  terminationDate?: string;
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
  contractType?: ContractQueueType;
  milestone?: ContractMilestone;
  daysFromExpiry?: number;
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
  yearlyContracts: number;
  monthlyContracts: number;
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
  recipient?: string;
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
  templateData?: {
    notificationSource?: string;
    recordType?: string;
    recordId?: string;
    invoiceNo?: string;
    contractNo?: string;
    renewalAmount?: string;
    oldAmount?: string;
    increaseRateInfo?: string;
    paymentLink?: string;
    [key: string]: unknown;
  };
}

// ==================== CRON DRY RUN TYPES ====================

export type CronName =
  | "invoice-notification"
  | "contract-notification-monthly"
  | "contract-notification-yearly"
  | "stale-pipeline"
  | "manager-log-reminder"
  | "prorated-invoice";

export interface CronManualRunRequest {
  targetType?: "lead" | "offer";
  contextId?: string;
  logId?: string;
  planId?: string;
}

export interface CronManualRunResponse {
  cronName: CronName;
  success: boolean;
  skipped: boolean;
  message: string;
  executedAt: string;
  durationMs: number;
  details?: Record<string, unknown>;
}

export interface DryRunNotificationItem {
  templateCode: string;
  channel: "email" | "sms";
  recipient: { email?: string; phone?: string; name?: string };
  contextType: string;
  contextId: string;
  customerId?: string;
  templateData: Record<string, unknown>;
}

export interface InvoiceNotificationDryRunResponse {
  cronName: "invoice-notification";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    invoiceNotificationCronEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    invoiceDueReminderDays: number[];
    invoiceOverdueDays: number[];
    invoiceLookbackDays: number;
  };
  summary: {
    totalInvoicesDue: number;
    totalInvoicesOverdue: number;
    totalNotificationsWouldSend: number;
    byChannel: { email: number; sms: number };
  };
  items: {
    invoiceNumber: string;
    invoiceId: string;
    customerId: string;
    customerName: string;
    grandTotal: number;
    dueDate: string;
    overdueDays?: number;
    status: "due" | "overdue";
    notifications: DryRunNotificationItem[];
    skippedReason?: string;
  }[];
}

export interface ContractNotificationDryRunResponse {
  cronName: "contract-notification-monthly" | "contract-notification-yearly";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    monthlyContractNotificationCronEnabled: boolean;
    yearlyContractNotificationCronEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    contractExpiryDays: number[];
  };
  summary: {
    totalContracts: number;
    totalNotificationsWouldSend: number;
    byChannel: { email: number; sms: number };
  };
  items: {
    contractId: string;
    company: string;
    customerId: string;
    customerName: string;
    endDate: string;
    remainingDays: number;
    notifications: DryRunNotificationItem[];
    skippedReason?: string;
  }[];
}

export interface StalePipelineDryRunResponse {
  cronName: "stale-pipeline";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    stalePipelineCronEnabled: boolean;
  };
  summary: {
    totalStaleLeads: number;
    totalStaleOffers: number;
    totalNotificationsWouldCreate: number;
    alreadyNotifiedCount: number;
  };
  items: {
    type: "lead" | "offer";
    id: string;
    name: string;
    userId: string;
    customerId: string;
    message: string;
    alreadyNotified: boolean;
  }[];
}

export interface ManagerLogReminderDryRunResponse {
  cronName: "manager-log-reminder";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    managerLogReminderCronEnabled: boolean;
  };
  summary: {
    totalPendingReminders: number;
  };
  items: {
    logId: string;
    authorId: string;
    customerId: string;
    contextType: string;
    contextId: string;
    message: string;
    pipelineRef?: string;
  }[];
}

export interface ProratedInvoiceDryRunResponse {
  cronName: "prorated-invoice";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    proratedInvoiceCronEnabled: boolean;
  };
  summary: {
    totalUninvoicedPlans: number;
    uniqueCustomers: number;
    totalAmount: number;
  };
  items: {
    planId: string;
    contractId: string;
    customerId: string;
    amount: number;
    payDate: string;
    description?: string;
  }[];
}

export type CronDryRunResponse =
  | InvoiceNotificationDryRunResponse
  | ContractNotificationDryRunResponse
  | StalePipelineDryRunResponse
  | ManagerLogReminderDryRunResponse
  | ProratedInvoiceDryRunResponse;
