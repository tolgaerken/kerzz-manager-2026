import { apiGet, apiPost } from "../../../lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export interface CaptchaResponse {
  challengeId: string;
  code: string;
  expiresInSeconds: number;
}

export interface InvoicePdfResponse {
  pdf: string;
  invoiceNumber: string;
  customerName: string;
}

export interface VerifyCaptchaInput {
  challengeId: string;
  code: string;
}

export async function getInvoiceCaptcha(invoiceUuid: string): Promise<CaptchaResponse> {
  const url = `${API_BASE_URL}/invoices/public/${invoiceUuid}/captcha`;
  return apiGet<CaptchaResponse>(url, { skipAuth: true });
}

export async function viewInvoicePdf(
  invoiceUuid: string,
  data: VerifyCaptchaInput
): Promise<InvoicePdfResponse> {
  const url = `${API_BASE_URL}/invoices/public/${invoiceUuid}/view`;
  return apiPost<InvoicePdfResponse>(url, data, { skipAuth: true });
}
