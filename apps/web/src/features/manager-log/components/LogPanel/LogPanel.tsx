import { useCallback, useEffect } from "react";
import { LogPanelHeader } from "./LogPanelHeader";
import { LogMessageList } from "./LogMessageList";
import { LogInput } from "../LogInput/LogInput";
import { useLogPanelStore } from "../../store/logPanelStore";
import { useManagerLogs, useCreateManagerLog } from "../../hooks";
import { useAuthStore } from "../../../auth/store/authStore";
import type { CreateLogInput } from "../../types";

export function LogPanel() {
  const { isOpen, context, closePanel } = useLogPanelStore();
  const userInfo = useAuthStore((state) => state.userInfo);

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useManagerLogs({
    customerId: context?.customerId,
    contextType: context?.contextType,
    contextId: context?.contextId,
    limit: 100,
  });

  const createLogMutation = useCreateManagerLog();

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closePanel]);

  // Body scroll'u kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSendMessage = useCallback(
    async (input: Omit<CreateLogInput, "customerId" | "contextType" | "contextId" | "authorId" | "authorName">) => {
      console.log("[handleSendMessage] context:", context);
      console.log("[handleSendMessage] userInfo:", userInfo);
      console.log("[handleSendMessage] input:", input);

      if (!context || !userInfo) {
        console.log("[handleSendMessage] Early return - context or userInfo is null");
        return;
      }

      const logInput: CreateLogInput = {
        customerId: context.customerId,
        contextType: context.contextType,
        contextId: context.contextId,
        authorId: userInfo.id,
        authorName: userInfo.name,
        ...input,
      };

      console.log("[handleSendMessage] logInput:", logInput);

      await createLogMutation.mutateAsync(logInput);
      refetch();
    },
    [context, userInfo, createLogMutation, refetch]
  );

  if (!isOpen) return null;

  // Genel mod mu yoksa context modunda mı?
  const isGeneralMode = !context;
  const panelTitle = context?.title || "Tüm Loglar";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={closePanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface z-50 shadow-xl flex flex-col animate-slide-in-right">
        <LogPanelHeader title={panelTitle} onClose={closePanel} />

        <LogMessageList
          logs={logsData?.data || []}
          currentUserId={userInfo?.id || ""}
          isLoading={isLoading}
          error={error}
        />

        {/* Genel modda input gizle - context olmadan log oluşturulamaz */}
        {!isGeneralMode && (
          <LogInput
            onSend={handleSendMessage}
            isLoading={createLogMutation.isPending}
          />
        )}
      </div>
    </>
  );
}
