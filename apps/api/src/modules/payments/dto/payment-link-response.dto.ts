export interface PaymentLinkItemDto {
  _id: string;
  linkId: string;
  staffName: string;
  staffId: string;
  customerId: string;
  customerName: string;
  email: string;
  name: string;
  gsm: string;
  amount: number;
  status: string;
  statusMessage: string;
  companyId: string;
  createDate: Date;
}

export interface PaymentLinkPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPaymentLinksResponseDto {
  data: PaymentLinkItemDto[];
  pagination: PaymentLinkPaginationDto;
}

export interface PaymentInfoDto {
  id: string;
  linkId: string;
  paytrToken: string;
  merchantId: string;
  paymentAmount: number;
  currency: string;
  installmentCount: string;
  non3d: string;
  storeCard: string;
  userIp: string;
  postUrl: string;
  status: string;
  statusMessage: string;
  email: string;
  name: string;
  gsm: string;
  customerName: string;
  customerId: string;
  companyId: string;
  amount: number;
  canRecurring: boolean;
  staffName: string;
  staffId: string;
  createDate: Date;
  [key: string]: unknown;
}
