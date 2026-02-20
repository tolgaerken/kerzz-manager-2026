import { apiGet } from "../../../lib/apiClient";
import type { ContractPaymentDetailDto } from "../types/contractPaymentDetail.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export async function getContractPaymentDetail(linkId: string): Promise<ContractPaymentDetailDto> {
  const url = `${API_BASE_URL}/payments/links/${linkId}/contract-detail`;
  return apiGet<ContractPaymentDetailDto>(url, { skipAuth: true });
}
