export interface GroupCompany {
  _id: string;
  id: string;
  idc: string;
  name: string;
  cloudDb: string;
  licanceId: string;
  eInvoice: boolean;
  vatNo: string;
  noVat: boolean;
  exemptionReason: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesQueryParams {
  includeInactive?: boolean;
}

export interface UpdateGroupCompanyInput {
  idc?: string;
  name?: string;
  cloudDb?: string;
  licanceId?: string;
  eInvoice?: boolean;
  vatNo?: string;
  noVat?: boolean;
  exemptionReason?: string;
  description?: string;
  isActive?: boolean;
}
