export class CustomerSegmentResponseDto {
  _id: string;
  name: string;
  description: string;
  invoiceOverdueNotification: boolean;
  newInvoiceNotification: boolean;
  lastPaymentNotification: boolean;
  balanceNotification: boolean;
  annualContractExpiryNotification: boolean;
  monthlyContractExpiryNotification: boolean;
  canBlockCashRegister: boolean;
  canBlockLicense: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class PaginatedCustomerSegmentsResponseDto {
  data: CustomerSegmentResponseDto[];
  meta: PaginationMetaDto;
}
