export class BankTransactionResponseDto {
  _id: string;
  id: string;
  accountId: string;
  name: string;
  dc: string;
  code: string;
  amount: number;
  balance: number;
  description: string;
  businessDate: Date;
  createDate: Date;
  opponentId: string;
  opponentIban: string;
  sourceId: string;
  source: string;
  bankAccId: string;
  bankAccName: string;
  bankId: string;
  bankName: string;
  erpStatus: string;
  erpMessage: string;
  erpGlAccountCode: string;
  erpAccountCode: string;
}

export class BankTransactionsListResponseDto {
  data: BankTransactionResponseDto[];
  total: number;
}
