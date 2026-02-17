import { X, MessageSquare, Calendar, User, AlertCircle } from "lucide-react";
import type { Feedback, FeedbackPriority } from "../../types/feedback.types";
import { STATUS_LABELS, PRIORITY_LABELS } from "../../types/feedback.types";
import { useFeedbackReplies, useCreateReply } from "../../hooks/useFeedbacks";
import { ReplyThread } from "./ReplyThread";
import { ReplyForm } from "./ReplyForm";

interface FeedbackDetailPanelProps {
  feedback: Feedback;
  onClose: () => void;
}

const STATUS_CLASS_MAP: Record<string, string> = {
  open: "bg-[var(--color-info)]/20 text-[var(--color-info)]",
  in_progress: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
  completed: "bg-[var(--color-success)]/20 text-[var(--color-success)]",
  rejected: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
};

const PRIORITY_CLASS_MAP: Record<string, string> = {
  low: "bg-[var(--color-muted-foreground)]/20 text-[var(--color-muted-foreground)]",
  medium: "bg-[var(--color-info)]/20 text-[var(--color-info)]",
  high: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
  urgent: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackDetailPanel({
  feedback,
  onClose,
}: FeedbackDetailPanelProps) {
  const { data: replies = [], isLoading: isLoadingReplies } =
    useFeedbackReplies(feedback.id);
  const createReplyMutation = useCreateReply();

  const handleReply = async (
    parentId: string,
    data: {
      description: string;
      screenshots?: string[];
      priority?: FeedbackPriority;
    },
  ) => {
    await createReplyMutation.mutateAsync({
      ...data,
      parentId,
    });
  };

  const handleRootReply = async (data: {
    description: string;
    screenshots?: string[];
    priority?: FeedbackPriority;
  }) => {
    await createReplyMutation.mutateAsync({
      ...data,
      parentId: feedback.id,
    });
  };

  return (
    <div className="flex h-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
          Detay
        </h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Feedback Info */}
        <div className="border-b border-[var(--color-border)] p-4">
          {/* Title */}
          <h3 className="mb-2 text-lg font-medium text-[var(--color-foreground)]">
            {feedback.title}
          </h3>

          {/* Meta */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS_MAP[feedback.status] || STATUS_CLASS_MAP.open}`}
            >
              {STATUS_LABELS[feedback.status]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_CLASS_MAP[feedback.priority] || PRIORITY_CLASS_MAP.medium}`}
            >
              {PRIORITY_LABELS[feedback.priority]}
            </span>
          </div>

          {/* Description */}
          <div
            className="prose prose-sm max-w-none text-[var(--color-foreground)]"
            dangerouslySetInnerHTML={{ __html: feedback.description }}
          />

          {/* Screenshots */}
          {feedback.screenshots && feedback.screenshots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {feedback.screenshots.map((screenshot, index) => (
                <a
                  key={`${screenshot.slice(0, 24)}-${index}`}
                  href={screenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-20 w-20 overflow-hidden rounded-md border border-[var(--color-border)]"
                >
                  <img
                    src={screenshot}
                    alt={`Ekran görüntüsü ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{feedback.createdByName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{feedback.replyCount || 0} yanıt</span>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
            <MessageSquare className="h-4 w-4" />
            Yanıtlar
          </h4>

          {isLoadingReplies ? (
            <div className="py-4 text-center text-sm text-[var(--color-muted-foreground)]">
              Yükleniyor...
            </div>
          ) : (
            <ReplyThread
              replies={replies}
              rootFeedbackId={feedback.id}
              onReply={handleReply}
              isCreatingReply={createReplyMutation.isPending}
            />
          )}
        </div>
      </div>

      {/* Reply Form - Footer */}
      <div className="border-t border-[var(--color-border)] p-4">
        <ReplyForm
          onSubmit={handleRootReply}
          isLoading={createReplyMutation.isPending}
          placeholder="Bu geribildirimi yanıtla..."
        />
      </div>
    </div>
  );
}
