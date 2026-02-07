export interface AutoPaymentTokenItemDto {
  _id: string;
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  erpId: string;
  companyId: string;
  userToken: string;
  sourceId: string;
  source: string;
  userId: string;
  balance: number;
  createDate: Date;
}

export interface AutoPaymentTokenPaginationDto {
  total: number;
}

export interface PaginatedAutoPaymentTokensResponseDto {
  data: AutoPaymentTokenItemDto[];
  pagination: AutoPaymentTokenPaginationDto;
}

export interface CardItemDto {
  ctoken: string;
  last_4: string;
  month: string;
  year: string;
  c_bank: string;
  require_cvv: string;
  c_name: string;
  c_brand: string;
  c_type: string;
}

export interface CollectPaymentResponseDto {
  success: boolean;
  paymentId: string;
  amount: number;
  message: string;
  paymentError?: string;
}
