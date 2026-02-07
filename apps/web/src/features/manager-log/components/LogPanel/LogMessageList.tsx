import { useRef, useEffect } from "react";
import { Loader2, MessageSquareOff } from "lucide-react";
import { LogMessageItem } from "./LogMessageItem";
import type { Log } from "../../types";

interface LogMessageListProps {
  logs: Log[];
  currentUserId: string;
  isLoading: boolean;
  error: Error | null;
}

export function LogMessageList({
  logs,
  currentUserId,
  isLoading,
  error,
}: LogMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs.length]);

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

  // Logları tarihe göre sırala (eskiden yeniye)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
        />
      ))}
    </div>
  );
}
