export class ManagerLogMentionResponseDto {
  userId: string;
  userName: string;
}

export class ManagerLogReferenceResponseDto {
  type: string;
  id: string;
  label: string;
}

export class ManagerLogReminderResponseDto {
  date: Date;
  completed: boolean;
}

export class ManagerLogResponseDto {
  _id: string;
  id: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  mentions: ManagerLogMentionResponseDto[];
  references: ManagerLogReferenceResponseDto[];
  reminder: ManagerLogReminderResponseDto | null;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedManagerLogsResponseDto {
  data: ManagerLogResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
