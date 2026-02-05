export class ContractUserResponseDto {
  _id: string;
  id: string;
  contractId: string;
  email: string;
  gsm: string;
  name: string;
  role: string;
  editDate: Date;
  editUser: string;
}

export class ContractUsersListResponseDto {
  data: ContractUserResponseDto[];
  total: number;
}
