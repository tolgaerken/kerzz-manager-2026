import { useState, useMemo } from "react";
import { MessageSquare, ChevronDown, ChevronRight, User } from "lucide-react";
import type { Feedback, FeedbackPriority } from "../../types/feedback.types";
import { ReplyForm } from "./ReplyForm";

interface ReplyThreadProps {
  replies: Feedback[];
  rootFeedbackId: string;
  onReply: (
    parentId: string,
    data: {
      description: string;
      screenshots?: string[];
      priority?: FeedbackPriority;
    },
  ) => Promise<void>;
  isCreatingReply?: boolean;
}

interface ReplyNode {
  reply: Feedback;
  children: ReplyNode[];
}

function buildReplyTree(
  replies: Feedback[],
  rootFeedbackId: string,
): ReplyNode[] {
  const replyMap = new Map<string, ReplyNode>();

  // Tüm reply'ları node olarak oluştur
  for (const reply of replies) {
    replyMap.set(reply.id, { reply, children: [] });
  }

  const rootNodes: ReplyNode[] = [];

  // Parent-child ilişkilerini kur
  for (const reply of replies) {
    const node = replyMap.get(reply.id);
    if (!node) continue;

    if (reply.parentId === rootFeedbackId) {
      // Root feedback'e doğrudan yanıt
      rootNodes.push(node);
    } else if (reply.parentId && replyMap.has(reply.parentId)) {
      // Başka bir reply'a yanıt
      const parentNode = replyMap.get(reply.parentId);
      parentNode?.children.push(node);
    }
  }

  return rootNodes;
}

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

interface ReplyItemProps {
  node: ReplyNode;
  depth: number;
  onReply: (
    parentId: string,
    data: {
      description: string;
      screenshots?: string[];
      priority?: FeedbackPriority;
    },
  ) => Promise<void>;
  isCreatingReply?: boolean;
}

function ReplyItem({ node, depth, onReply, isCreatingReply }: ReplyItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const { reply, children } = node;
  const hasChildren = children.length > 0;

  const handleReply = async (data: {
    description: string;
    screenshots?: string[];
    priority?: FeedbackPriority;
  }) => {
    await onReply(reply.id, data);
    setShowReplyForm(false);
  };

  return (
    <div
      className="relative"
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 16, 48)}px` : 0 }}
    >
      {/* Bağlantı çizgisi */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 h-full w-px bg-[var(--color-border)]" />
      )}

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-0.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
              <span className="font-medium text-[var(--color-foreground)]">
                {reply.createdByName}
              </span>
            </div>
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {formatDate(reply.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm text-[var(--color-foreground)]">
          {reply.description}
        </div>

        {/* Screenshots */}
        {reply.screenshots && reply.screenshots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {reply.screenshots.map((screenshot, index) => (
              <a
                key={`${screenshot.slice(0, 24)}-${index}`}
                href={screenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-16 w-16 overflow-hidden rounded-md border border-[var(--color-border)]"
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

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
          >
            <MessageSquare className="h-3 w-3" />
            Yanıtla
          </button>
          {hasChildren && (
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {children.length} yanıt
            </span>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <ReplyForm
              onSubmit={handleReply}
              isLoading={isCreatingReply}
              placeholder="Yanıtınızı yazın..."
            />
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2">
          {children.map((childNode) => (
            <ReplyItem
              key={childNode.reply.id}
              node={childNode}
              depth={depth + 1}
              onReply={onReply}
              isCreatingReply={isCreatingReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ReplyThread({
  replies,
  rootFeedbackId,
  onReply,
  isCreatingReply,
}: ReplyThreadProps) {
  const replyTree = useMemo(
    () => buildReplyTree(replies, rootFeedbackId),
    [replies, rootFeedbackId],
  );

  if (replyTree.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[var(--color-muted-foreground)]">
        Henüz yanıt yok
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {replyTree.map((node) => (
        <ReplyItem
          key={node.reply.id}
          node={node}
          depth={0}
          onReply={onReply}
          isCreatingReply={isCreatingReply}
        />
      ))}
    </div>
  );
}
