// ── Ortak tipler ──

export interface DryRunNotificationItem {
  templateCode: string;
  channel: "email" | "sms";
  recipient: { email?: string; phone?: string; name?: string };
  contextType: string;
  contextId: string;
  customerId?: string;
  templateData: Record<string, unknown>;
}

// ── Invoice Notification ──

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
  items: InvoiceDryRunItem[];
}

export interface InvoiceDryRunItem {
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
}

// ── Contract Notification ──

export interface ContractNotificationDryRunResponse {
  cronName: "contract-notification";
  executedAt: string;
  durationMs: number;
  settings: {
    cronEnabled: boolean;
    contractNotificationCronEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    contractExpiryDays: number[];
  };
  summary: {
    totalContracts: number;
    totalNotificationsWouldSend: number;
    byChannel: { email: number; sms: number };
  };
  items: ContractDryRunItem[];
}

export interface ContractDryRunItem {
  contractId: string;
  company: string;
  customerId: string;
  customerName: string;
  endDate: string;
  remainingDays: number;
  notifications: DryRunNotificationItem[];
  skippedReason?: string;
  isYearly?: boolean;
}

// ── Stale Pipeline ──

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
  items: StalePipelineDryRunItem[];
}

export interface StalePipelineDryRunItem {
  type: "lead" | "offer";
  id: string;
  name: string;
  userId: string;
  customerId: string;
  message: string;
  alreadyNotified: boolean;
}

// ── Manager Log Reminder ──

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
  items: ManagerLogReminderDryRunItem[];
}

export interface ManagerLogReminderDryRunItem {
  logId: string;
  authorId: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  pipelineRef?: string;
}

// ── Prorated Invoice ──

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
  items: ProratedInvoiceDryRunItem[];
}

export interface ProratedInvoiceDryRunItem {
  planId: string;
  contractId: string;
  customerId: string;
  amount: number;
  payDate: string;
  description?: string;
}

// ── Union type ──

export type CronDryRunResponse =
  | InvoiceNotificationDryRunResponse
  | ContractNotificationDryRunResponse
  | StalePipelineDryRunResponse
  | ManagerLogReminderDryRunResponse
  | ProratedInvoiceDryRunResponse;

export type CronName =
  | "invoice-notification"
  | "contract-notification"
  | "stale-pipeline"
  | "manager-log-reminder"
  | "prorated-invoice";
