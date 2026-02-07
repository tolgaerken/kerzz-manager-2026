import type { PaymentListItemView } from "../interfaces";

export class EnrichedPaymentPlanResponseDto {
  _id: string;
  id: string;
  contractId: string;
  company: string;
  brand: string;
  customerId: string;
  licanceId: string;
  invoiceNo: string;
  paid: boolean;
  payDate: Date;
  paymentDate: Date;
  invoiceDate: Date;
  total: number;
  invoiceTotal: number;
  balance: number;
  list: PaymentListItemView[];
  yearly: boolean;
  eInvoice: boolean;
  uuid: string;
  ref: string;
  taxNo: string;
  internalFirm: string;
  contractNumber: number;
  segment: string;
  block: boolean;
  editDate: Date;
  editUser: string;
  companyId: string;
  dueDate: Date;
  invoiceError?: string;
}

export class PaymentPlansListResponseDto {
  data: EnrichedPaymentPlanResponseDto[];
  total: number;
}
