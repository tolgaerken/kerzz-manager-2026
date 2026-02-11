export type LegacyLogType =
  | "contract"
  | "licence"
  | "account"
  | "customer"
  | "sale"
  | "payment"
  | "invoice"
  | "setup"
  | "e-invoice";

export interface LegacyLogPerson {
  id: string;
  name: string;
}

export interface LegacyLogEntity {
  id?: string;
  log: string;
  date: Date;
  userId: string;
  userName: string;
  notifyUsers?: LegacyLogPerson[];
  resolved?: boolean;
  accountId?: string;
  customerId?: string;
  licenceId?: string;
  contractId?: string;
  saleId?: string;
  logType?: LegacyLogType;
}
