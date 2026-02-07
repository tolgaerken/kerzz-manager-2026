export class BankSummaryItemDto {
  bankAccId: string;
  bankAccName: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export class BankSummaryResponseDto {
  summaries: BankSummaryItemDto[];
  totalInflow: number;
  totalOutflow: number;
  totalBalance: number;
  transactionCount: number;
}
