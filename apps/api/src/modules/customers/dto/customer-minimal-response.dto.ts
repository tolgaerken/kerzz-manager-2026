export interface ErpMappingMinimalDto {
  companyId: string;
  erpId: string;
  isPrimary?: boolean;
}

export interface CustomerMinimalResponseDto {
  _id: string;
  id: string;
  name?: string;
  brand?: string;
  erpId?: string;
  erpMappings?: ErpMappingMinimalDto[];
  taxNo?: string;
}
