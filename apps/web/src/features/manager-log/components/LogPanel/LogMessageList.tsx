import { useRef, useEffect, useCallback } from "react";
import { Loader2, MessageSquareOff } from "lucide-react";
import { LogMessageItem } from "./LogMessageItem";
import type { Log } from "../../types";

interface LogMessageListProps {
  logs: Log[];
  currentUserId: string;
  isLoading: boolean;
  error: Error | null;
  highlightLogId?: string | null;
  onHighlightSeen?: () => void;
}

export function LogMessageList({
  logs,
  currentUserId,
  isLoading,
  error,
  highlightLogId,
  onHighlightSeen,
}: LogMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // En yeni log üstte gösterildiği için listeyi üste sabitle
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  // Highlight görüldüğünde çağrılacak callback
  // Hook'lar her zaman aynı sırada çağrılmalı, early return'lerden önce tanımlanmalı
  const handleHighlightSeen = useCallback(() => {
    onHighlightSeen?.();
  }, [onHighlightSeen]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <MessageSquareOff className="w-12 h-12 mb-2" />
        <p className="text-sm">Loglar yüklenirken hata oluştu</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <MessageSquareOff className="w-12 h-12 mb-2" />
        <p className="text-sm">Henüz log yok</p>
        <p className="text-xs mt-1">İlk logu siz ekleyin!</p>
      </div>
    );
  }

  // Logları tarihe göre sırala (yeniden eskiye)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto px-4 py-3"
    >
      {sortedLogs.map((log) => (
        <LogMessageItem
          key={log._id}
          log={log}
          isOwn={log.authorId === currentUserId}
          highlighted={highlightLogId === log._id}
          onHighlightSeen={handleHighlightSeen}
        />
      ))}
    </div>
  );
}
