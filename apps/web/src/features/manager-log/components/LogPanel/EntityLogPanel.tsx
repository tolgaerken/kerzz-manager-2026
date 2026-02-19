import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Key,
  Receipt,
  CreditCard,
  FileDigit,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { LogPanelHeader } from "./LogPanelHeader";
import { LogPanelContextBanner } from "./LogPanelContextBanner";
import { EntityLogTab } from "./EntityLogTab";
import { useLogPanelStore } from "../../store/logPanelStore";
import { useCustomer } from "../../../customers/hooks/useCustomers";
import { useManagerLog, useEntityLogCounts } from "../../hooks";
import type { EntityTabType, EntityTabConfig } from "../../types";

/** Tab konfigürasyonları */
const TAB_CONFIGS: EntityTabConfig[] = [
  { type: "contract", label: "Kontrat", icon: "FileText", enabled: true },
  { type: "collection", label: "Tahsilat", icon: "CreditCard", enabled: true },
  { type: "e-transform", label: "E-Dönüşüm", icon: "RefreshCw", enabled: true },
  { type: "license", label: "Lisans", icon: "Key", enabled: true },
  { type: "invoice", label: "Fatura", icon: "Receipt", enabled: true },
  { type: "technical", label: "Kurulum", icon: "Wrench", enabled: true },
];

/** Icon bileşenlerini döndür */
function getTabIcon(iconName: string, className: string) {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className={className} />,
    Key: <Key className={className} />,
    Receipt: <Receipt className={className} />,
    CreditCard: <CreditCard className={className} />,
    FileDigit: <FileDigit className={className} />,
    RefreshCw: <RefreshCw className={className} />,
    Wrench: <Wrench className={className} />,
  };
  return icons[iconName] || null;
}

/** Context'ten ilgili entity ID'sini al */
function getContextId(
  type: EntityTabType,
  context: {
    contractId?: string;
    licenseId?: string;
    invoiceId?: string;
    paymentPlanId?: string;
    collectionId?: string;
    eTransformId?: string;
    technicalId?: string;
  }
): string | undefined {
  const idMap: Record<EntityTabType, string | undefined> = {
    contract: context.contractId,
    license: context.licenseId,
    invoice: context.invoiceId,
    "payment-plan": context.paymentPlanId,
    collection: context.collectionId,
    "e-transform": context.eTransformId,
    technical: context.technicalId,
  };
  return idMap[type];
}

export function EntityLogPanel() {
  const { isOpen, isEntityMode, entityContext, closePanel, highlightLogId, clearHighlight } = useLogPanelStore();

  // Aktif tab state - context'ten gelen activeTab ile başla
  const [activeTab, setActiveTab] = useState<EntityTabType>("contract");

  // customerName yoksa API'den çek
  const shouldFetchCustomer = isOpen && isEntityMode && entityContext && !entityContext.customerName;
  const { data: customerData } = useCustomer(shouldFetchCustomer ? entityContext?.customerId ?? null : null);

  // contextLabel yoksa ve highlightLogId varsa log'dan çek
  const shouldFetchLog = isOpen && isEntityMode && entityContext && !entityContext.contextLabel && highlightLogId;
  const { data: logData } = useManagerLog(shouldFetchLog ? highlightLogId : null);

  // Müşteri adını belirle (context'ten veya API'den)
  const resolvedCustomerName = useMemo(() => {
    if (entityContext?.customerName) return entityContext.customerName;
    if (customerData) return customerData.name || customerData.brand;
    return undefined;
  }, [entityContext?.customerName, customerData]);

  // Context label'ı belirle (context'ten veya log references'tan)
  const resolvedContextLabel = useMemo(() => {
    if (entityContext?.contextLabel) return entityContext.contextLabel;
    if (logData?.references && logData.references.length > 0) {
      // Aktif tab'a göre ilgili reference'ı bul
      const matchingRef = logData.references.find((ref) => ref.type === entityContext?.activeTab);
      if (matchingRef?.label) return matchingRef.label;
      // Yoksa ilk reference'ın label'ını kullan
      return logData.references[0]?.label;
    }
    return undefined;
  }, [entityContext?.contextLabel, entityContext?.activeTab, logData?.references]);

  // ESC tuşu ile kapat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && isEntityMode) {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isEntityMode, closePanel]);

  // Body scroll'u kilitle
  useEffect(() => {
    if (isOpen && isEntityMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isEntityMode]);

  // Context değiştiğinde aktif tab'ı güncelle
  useEffect(() => {
    if (entityContext?.activeTab) {
      setActiveTab(entityContext.activeTab);
    }
  }, [entityContext?.activeTab]);

  // Tab başına log count'larını getir
  const { counts: logCounts } = useEntityLogCounts(entityContext);

  if (!isOpen || !isEntityMode || !entityContext) return null;

  const panelTitle = entityContext.title || "Loglar";
  const contextId = getContextId(activeTab, entityContext);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={closePanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--color-surface)] z-50 shadow-xl flex flex-col animate-slide-in-right">
        <LogPanelHeader title={panelTitle} onClose={closePanel} />

        {/* Context Banner - Müşteri adı ve kaynak bilgisi */}
        <LogPanelContextBanner
          customerName={resolvedCustomerName}
          contextLabel={resolvedContextLabel}
          activeTab={activeTab}
        />

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-x-auto">
          {TAB_CONFIGS.map((tab) => {
            const isActive = activeTab === tab.type;
            const hasId = !!getContextId(tab.type, entityContext);

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                  transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : hasId
                        ? "bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                        : "bg-[var(--color-surface)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)]"
                  }
                `}
              >
                {getTabIcon(tab.icon, "w-3.5 h-3.5")}
                {tab.label}
                {logCounts[tab.type] > 0 && (
                  <span
                    className={`ml-1 min-w-[1.25rem] px-1 py-0.5 text-[10px] font-medium rounded-full text-center ${
                      isActive
                        ? "bg-[var(--color-primary-foreground)]/20"
                        : "bg-[var(--color-muted-foreground)]/20"
                    }`}
                  >
                    {logCounts[tab.type]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <EntityLogTab
          customerId={entityContext.customerId}
          contextType={activeTab}
          contextId={contextId}
          highlightLogId={highlightLogId}
          onHighlightSeen={clearHighlight}
        />
      </div>
    </>
  );
}
