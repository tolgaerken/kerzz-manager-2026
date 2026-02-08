export class LeadActivityDto {
  description: string;
  userId: string;
  userName: string;
  date: Date;
  type: string;
}

export class LeadResponseDto {
  _id: string;
  pipelineRef: string;
  customerId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  companyName: string;
  source: string;
  assignedUserId: string;
  assignedUserName: string;
  status: string;
  priority: string;
  notes: string;
  estimatedValue: number;
  currency: string;
  expectedCloseDate: Date;
  labels: string[];
  activities: LeadActivityDto[];
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

export class PaginatedLeadsResponseDto {
  data: LeadResponseDto[];
  meta: PaginationMetaDto;
}

export class LeadStatsDto {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  unqualified: number;
  converted: number;
  lost: number;
}
