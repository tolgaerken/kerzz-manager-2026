import { useCallback } from "react";
import { LogMessageList } from "./LogMessageList";
import { LogInput } from "../LogInput/LogInput";
import { useManagerLogs, useCreateManagerLog } from "../../hooks";
import { useAuthStore } from "../../../auth/store/authStore";
import type { CreateLogInput, EntityTabType } from "../../types";

interface EntityLogTabProps {
  customerId: string;
  contextType: EntityTabType;
  contextId: string | undefined;
  highlightLogId?: string | null;
  onHighlightSeen?: () => void;
}

export function EntityLogTab({
  customerId,
  contextType,
  contextId,
  highlightLogId,
  onHighlightSeen,
}: EntityLogTabProps) {
  const userInfo = useAuthStore((state) => state.userInfo);

  const isGeneralTab = !contextId;
  const effectiveContextId = contextId ?? customerId;

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useManagerLogs(
    {
      customerId,
      contextType,
      contextId: isGeneralTab ? undefined : contextId,
      limit: 100,
    },
    !!customerId
  );

  const createLogMutation = useCreateManagerLog();

  const handleSendMessage = useCallback(
    async (
      input: Omit<
        CreateLogInput,
        "customerId" | "contextType" | "contextId" | "authorId" | "authorName"
      >
    ) => {
      if (!userInfo) return;

      const logInput: CreateLogInput = {
        customerId,
        contextType,
        contextId: effectiveContextId,
        authorId: userInfo.id,
        authorName: userInfo.name,
        ...input,
      };

      await createLogMutation.mutateAsync(logInput);
      refetch();
    },
    [customerId, contextType, effectiveContextId, userInfo, createLogMutation, refetch]
  );

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

      <LogInput onSend={handleSendMessage} isLoading={createLogMutation.isPending} />
    </div>
  );
}
