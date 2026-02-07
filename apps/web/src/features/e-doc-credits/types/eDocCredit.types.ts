export interface EDocCreditItem {
  _id: string;
  id: string;
  erpId: string;
  customerId: string;
  customerName: string;
  price: number;
  count: number;
  total: number;
  currency: string;
  internalFirm: string;
  date: string;
  invoiceNumber: string;
  invoiceUUID: string;
  invoiceDate: string;
  grandTotal: number;
  taxTotal: number;
  invoiceNo: string;
  editDate: string;
  editUser: string;
}

export interface EDocCreditQueryParams {
  search?: string;
  erpId?: string;
  currency?: string;
  internalFirm?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface EDocCreditsResponse {
  data: EDocCreditItem[];
  total: number;
}

export interface EDocCreditFormData {
  erpId: string;
  customerId: string;
  price: number;
  count: number;
  currency: string;
  internalFirm: string;
  date: string;
}
