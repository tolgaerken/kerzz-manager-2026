import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareOff, Users, FileText, ShoppingCart } from "lucide-react";
import { LogPanelHeader } from "./LogPanelHeader";
import { PipelineLogSection } from "./PipelineLogSection";
import { LogInput } from "../LogInput/LogInput";
import { useLogPanelStore } from "../../store/logPanelStore";
import { usePipelineLogs, useCreateManagerLog } from "../../hooks";
import { useAuthStore } from "../../../auth/store/authStore";
import type { CreateLogInput, PipelineLogPanelContext } from "../../types";

type ContextType = "lead" | "offer" | "sale";

interface ActiveContext {
  type: ContextType;
  id: string;
  customerId: string;
}

export function PipelineLogPanel() {
  const { isOpen, isPipelineMode, pipelineContext, closePanel, highlightLogId, clearHighlight } = useLogPanelStore();
  const userInfo = useAuthStore((state) => state.userInfo);
  
  // Aktif context - hangi entity'ye log ekleneceğini belirler
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);

  const {
    data: pipelineData,
    isLoading,
    error,
    refetch,
  } = usePipelineLogs(pipelineContext?.pipelineRef);

  const createLogMutation = useCreateManagerLog();

  // Pipeline'daki herhangi bir kaynaktan customerId'yi bul
  // Öncelik: pipelineContext > sale logs > offer logs > lead logs
  const resolveCustomerId = useCallback((): string => {
    // 1. pipelineContext'ten gelen customerId
    if (pipelineContext?.customerId) {
      return pipelineContext.customerId;
    }

    // 2. pipelineData'daki loglardan customerId bul (en son aşamadan başla)
    if (pipelineData) {
      // Sale loglarından
      if (pipelineData.sale.length > 0) {
        const saleCustomerId = pipelineData.sale.find(log => log.customerId)?.customerId;
        if (saleCustomerId) return saleCustomerId;
      }
      // Offer loglarından
      if (pipelineData.offer.length > 0) {
        const offerCustomerId = pipelineData.offer.find(log => log.customerId)?.customerId;
        if (offerCustomerId) return offerCustomerId;
      }
      // Lead loglarından
      if (pipelineData.lead.length > 0) {
        const leadCustomerId = pipelineData.lead.find(log => log.customerId)?.customerId;
        if (leadCustomerId) return leadCustomerId;
      }
    }

    return "";
  }, [pipelineContext, pipelineData]);

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && isPipelineMode) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isPipelineMode, closePanel]);

  // Body scroll'u kilitle
  useEffect(() => {
    if (isOpen && isPipelineMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isPipelineMode]);

  // Pipeline context veya data değiştiğinde aktif context'i belirle
  useEffect(() => {
    if (!pipelineContext) return;

    const customerId = resolveCustomerId();

    // Öncelik: pipelineContext'ten gelen entity ID'leri
    // Hangi sayfadan açıldıysa o entity'nin ID'si gelir
    if (pipelineContext.saleId) {
      setActiveContext({
        type: "sale",
        id: pipelineContext.saleId,
        customerId,
      });
      return;
    }

    if (pipelineContext.offerId) {
      setActiveContext({
        type: "offer",
        id: pipelineContext.offerId,
        customerId,
      });
      return;
    }

    if (pipelineContext.leadId) {
      setActiveContext({
        type: "lead",
        id: pipelineContext.leadId,
        customerId,
      });
      return;
    }

    // Fallback: pipelineData'dan en son aşamayı seç
    if (pipelineData) {
      if (pipelineData.sale.length > 0) {
        const lastSale = pipelineData.sale[pipelineData.sale.length - 1];
        setActiveContext({
          type: "sale",
          id: lastSale.contextId,
          customerId,
        });
      } else if (pipelineData.offer.length > 0) {
        const lastOffer = pipelineData.offer[pipelineData.offer.length - 1];
        setActiveContext({
          type: "offer",
          id: lastOffer.contextId,
          customerId,
        });
      } else if (pipelineData.lead.length > 0) {
        const lastLead = pipelineData.lead[pipelineData.lead.length - 1];
        setActiveContext({
          type: "lead",
          id: lastLead.contextId,
          customerId,
        });
      }
    }
  }, [pipelineData, pipelineContext, resolveCustomerId]);

  const handleSendMessage = useCallback(
    async (input: Omit<CreateLogInput, "customerId" | "contextType" | "contextId" | "authorId" | "authorName" | "pipelineRef">) => {
      if (!activeContext || !userInfo || !pipelineContext) {
        return;
      }

      const logInput: CreateLogInput = {
        customerId: activeContext.customerId,
        contextType: activeContext.type,
        contextId: activeContext.id,
        pipelineRef: pipelineContext.pipelineRef,
        authorId: userInfo.id,
        authorName: userInfo.name,
        ...input,
      };

      await createLogMutation.mutateAsync(logInput);
      refetch();
    },
    [activeContext, userInfo, pipelineContext, createLogMutation, refetch]
  );

  const handleContextChange = (type: ContextType) => {
    if (!pipelineContext) return;

    const customerId = resolveCustomerId();

    // Önce pipelineContext'ten gelen entity ID'lerini kontrol et
    const entityIdMap: Record<ContextType, string | undefined> = {
      lead: pipelineContext.leadId,
      offer: pipelineContext.offerId,
      sale: pipelineContext.saleId,
    };

    const entityId = entityIdMap[type];
    if (entityId) {
      setActiveContext({
        type,
        id: entityId,
        customerId,
      });
      return;
    }

    // Fallback: pipelineData'dan ilgili tipten son log'u bul
    if (pipelineData) {
      const logs = pipelineData[type];
      if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        setActiveContext({
          type,
          id: lastLog.contextId,
          customerId,
        });
        return;
      }
    }

    // Son fallback: sadece type ile context oluştur (id boş olabilir)
    setActiveContext({
      type,
      id: "",
      customerId,
    });
  };

  if (!isOpen || !isPipelineMode) return null;

  const panelTitle = pipelineContext?.title || `Pipeline: ${pipelineContext?.pipelineRef}`;

  const renderContent = () => {
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

    if (!pipelineData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquareOff className="w-12 h-12 mb-2" />
          <p className="text-sm">Pipeline bulunamadı</p>
        </div>
      );
    }

    const totalLogs = pipelineData.lead.length + pipelineData.offer.length + pipelineData.sale.length;

    if (totalLogs === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquareOff className="w-12 h-12 mb-2" />
          <p className="text-sm">Henüz log yok</p>
          <p className="text-xs mt-1">İlk logu siz ekleyin!</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Lead Section */}
        <PipelineLogSection
          title="Lead Aşaması"
          type="lead"
          logs={pipelineData.lead}
          currentUserId={userInfo?.id || ""}
          defaultExpanded={pipelineData.lead.length > 0}
          highlightLogId={highlightLogId}
          onHighlightSeen={clearHighlight}
        />

        {/* Offer Section */}
        <PipelineLogSection
          title="Teklif Aşaması"
          type="offer"
          logs={pipelineData.offer}
          currentUserId={userInfo?.id || ""}
          defaultExpanded={pipelineData.offer.length > 0}
          highlightLogId={highlightLogId}
          onHighlightSeen={clearHighlight}
        />

        {/* Sale Section */}
        <PipelineLogSection
          title="Satış Aşaması"
          type="sale"
          logs={pipelineData.sale}
          currentUserId={userInfo?.id || ""}
          defaultExpanded={pipelineData.sale.length > 0}
          highlightLogId={highlightLogId}
          onHighlightSeen={clearHighlight}
        />
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={closePanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface z-50 shadow-xl flex flex-col animate-slide-in-right">
        <LogPanelHeader title={panelTitle} onClose={closePanel} />

        {/* Context Selector */}
        {activeContext && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-elevated">
            <span className="text-xs text-muted-foreground">Log ekle:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleContextChange("lead")}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                  activeContext.type === "lead"
                    ? "bg-[var(--color-info)]/20 text-[var(--color-info)]"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground"
                }`}
              >
                <Users className="w-3 h-3" />
                Lead
              </button>
              <button
                onClick={() => handleContextChange("offer")}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                  activeContext.type === "offer"
                    ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground"
                }`}
              >
                <FileText className="w-3 h-3" />
                Teklif
              </button>
              <button
                onClick={() => handleContextChange("sale")}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                  activeContext.type === "sale"
                    ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                    : "bg-surface hover:bg-surface-hover text-muted-foreground"
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                Satış
              </button>
            </div>
          </div>
        )}

        {renderContent()}

        {/* Input - aktif context varsa ve id varsa göster */}
        {activeContext && activeContext.id && (
          <LogInput
            onSend={handleSendMessage}
            isLoading={createLogMutation.isPending}
          />
        )}

        {/* Hiç log yoksa ve activeContext.id boşsa bilgi mesajı */}
        {activeContext && !activeContext.id && (
          <div className="px-4 py-3 border-t border-border bg-surface-elevated">
            <p className="text-xs text-muted-foreground text-center">
              Bu pipeline için henüz log kaydı yok. İlk log, entity kaydedildikten sonra eklenebilir.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
