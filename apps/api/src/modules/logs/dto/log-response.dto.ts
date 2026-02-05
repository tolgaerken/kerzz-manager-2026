export class LogMentionResponseDto {
  userId: string;
  userName: string;
}

export class LogReferenceResponseDto {
  type: string;
  id: string;
  label: string;
}

export class LogReminderResponseDto {
  date: Date;
  completed: boolean;
}

export class LogResponseDto {
  _id: string;
  id: string;
  customerId: string;
  contextType: string;
  contextId: string;
  message: string;
  mentions: LogMentionResponseDto[];
  references: LogReferenceResponseDto[];
  reminder: LogReminderResponseDto | null;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedLogsResponseDto {
  data: LogResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
