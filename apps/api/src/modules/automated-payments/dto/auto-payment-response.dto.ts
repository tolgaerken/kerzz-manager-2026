export interface AutoPaymentTokenItemDto {
  _id: string;
  id: string;
  customerId: string;
  email: string;
  erpId: string;
  companyId: string;
  userToken: string;
  sourceId: string;
  source: string;
  userId: string;
  createDate: Date;
}

export interface AutoPaymentTokenPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
}
