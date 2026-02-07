export interface EInvoicePriceItem {
  _id: string;
  id: string;
  sequence: number;
  name: string;
  erpId: string;
  unitPrice: number;
  discountRate: number;
  quantity: number;
  totalPrice: number;
  isCredit: boolean;
  customerErpId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EInvoicePriceQueryParams {
  search?: string;
  customerErpId?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface EInvoicePricesResponse {
  data: EInvoicePriceItem[];
  total: number;
}

export interface EInvoicePriceFormData {
  name: string;
  erpId: string;
  unitPrice: number;
  discountRate: number;
  quantity: number;
  isCredit: boolean;
  customerErpId: string;
  sequence: number;
}
