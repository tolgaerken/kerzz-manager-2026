export interface EDocMemberItem {
  _id: string;
  id: string;
  erpId: string;
  licanceId: string;
  internalFirm: string;
  active: boolean;
  syncErp: boolean;
  syncInbound: boolean;
  desc: string;
  taxNumber: string;
  contractType: string;
  creditPrice: number;
  totalPurchasedCredits: number;
  creditBalance: number;
  contract: boolean;
  customerName: string;
  licenseName: string;
  // Hesaplanan bakiye alanları
  totalCharge: number;
  totalConsumption: number;
  monthlyAverage: number;
  editDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EDocMemberQueryParams {
  search?: string;
  erpId?: string;
  internalFirm?: string;
  contractType?: string;
  active?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface EDocMembersResponse {
  data: EDocMemberItem[];
  total: number;
}

export interface EDocMemberFormData {
  erpId: string;
  licanceId: string;
  internalFirm: string;
  active: boolean;
  desc: string;
  taxNumber: string;
  contractType: string;
  creditPrice: number;
  contract: boolean;
}
