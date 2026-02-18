import { useCallback } from "react";
import { Clock } from "lucide-react";
import { LogMessageList } from "./LogMessageList";
import { LogInput } from "../LogInput/LogInput";
import { useManagerLogs, useCreateManagerLog } from "../../hooks";
import { useAuthStore } from "../../../auth/store/authStore";
import type { CreateLogInput, EntityTabType } from "../../types";

interface EntityLogTabProps {
  customerId: string;
  contextType: EntityTabType;
  contextId: string | undefined;
  isPlaceholder?: boolean;
  placeholderMessage?: string;
  highlightLogId?: string | null;
  onHighlightSeen?: () => void;
}

export function EntityLogTab({
  customerId,
  contextType,
  contextId,
  isPlaceholder = false,
  placeholderMessage = "Bu özellik yakında eklenecek",
  highlightLogId,
  onHighlightSeen,
}: EntityLogTabProps) {
  const userInfo = useAuthStore((state) => state.userInfo);

  const isCollectionTab = contextType === "collection";
  const shouldFetch = !isPlaceholder && (isCollectionTab ? !!customerId : !!contextId);

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useManagerLogs(
    {
      customerId,
      contextType,
      contextId: isCollectionTab ? undefined : contextId,
      limit: 100,
    },
    shouldFetch
  );

  const createLogMutation = useCreateManagerLog();

  const handleSendMessage = useCallback(
    async (
      input: Omit<
        CreateLogInput,
        "customerId" | "contextType" | "contextId" | "authorId" | "authorName"
      >
    ) => {
      if (!contextId || !userInfo || isPlaceholder) {
        return;
      }

      const logInput: CreateLogInput = {
        customerId,
        contextType,
        contextId,
        authorId: userInfo.id,
        authorName: userInfo.name,
        ...input,
      };

      await createLogMutation.mutateAsync(logInput);
      refetch();
    },
    [customerId, contextType, contextId, userInfo, isPlaceholder, createLogMutation, refetch]
  );

  // Placeholder tab için "Yakında" mesajı
  if (isPlaceholder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-muted-foreground)]">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">{placeholderMessage}</p>
        <p className="text-xs mt-1 opacity-70">Bu alan geliştirme aşamasında</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <LogMessageList
        logs={logsData?.data || []}
        currentUserId={userInfo?.id || ""}
        isLoading={isLoading}
        error={error}
        highlightLogId={highlightLogId}
        onHighlightSeen={onHighlightSeen}
      />

      {/* contextId varsa log oluşturma aktif, yoksa sadece görüntüleme */}
      {contextId ? (
        <LogInput onSend={handleSendMessage} isLoading={createLogMutation.isPending} />
      ) : (
        <div className="px-4 py-3 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-muted-foreground)]">
          Bu tab'dan yeni log eklenemez
        </div>
      )}
    </div>
  );
}
