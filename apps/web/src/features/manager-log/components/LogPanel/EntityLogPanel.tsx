import { useState, useEffect } from "react";
import {
  FileText,
  Key,
  Receipt,
  Calendar,
  CreditCard,
  FileDigit,
  Wrench,
} from "lucide-react";
import { LogPanelHeader } from "./LogPanelHeader";
import { EntityLogTab } from "./EntityLogTab";
import { useLogPanelStore } from "../../store/logPanelStore";
import type { EntityTabType, EntityTabConfig } from "../../types";

/** Tab konfigürasyonları */
const TAB_CONFIGS: EntityTabConfig[] = [
  { type: "contract", label: "Kontrat", icon: "FileText", enabled: true },
  { type: "license", label: "Lisans", icon: "Key", enabled: true },
  { type: "invoice", label: "Fatura", icon: "Receipt", enabled: true },
  { type: "payment-plan", label: "Ödeme Planı", icon: "Calendar", enabled: true },
  { type: "collection", label: "Tahsilat", icon: "CreditCard", enabled: false },
  { type: "e-transform", label: "E-Dönüşüm", icon: "FileDigit", enabled: false },
  { type: "technical", label: "Teknik", icon: "Wrench", enabled: false },
];

/** Icon bileşenlerini döndür */
function getTabIcon(iconName: string, className: string) {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className={className} />,
    Key: <Key className={className} />,
    Receipt: <Receipt className={className} />,
    Calendar: <Calendar className={className} />,
    CreditCard: <CreditCard className={className} />,
    FileDigit: <FileDigit className={className} />,
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
  const { isOpen, isEntityMode, entityContext, closePanel } = useLogPanelStore();

  // Aktif tab state - context'ten gelen activeTab ile başla
  const [activeTab, setActiveTab] = useState<EntityTabType>("contract");

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

  if (!isOpen || !isEntityMode || !entityContext) return null;

  const panelTitle = entityContext.title || "Loglar";
  const activeTabConfig = TAB_CONFIGS.find((t) => t.type === activeTab);
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
                      : tab.enabled && hasId
                        ? "bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                        : "bg-[var(--color-surface)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)]"
                  }
                  ${!tab.enabled ? "opacity-60" : ""}
                `}
                title={!tab.enabled ? "Yakında" : undefined}
              >
                {getTabIcon(tab.icon, "w-3.5 h-3.5")}
                {tab.label}
                {!tab.enabled && (
                  <span className="ml-1 text-[10px] opacity-70">•</span>
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
          isPlaceholder={!activeTabConfig?.enabled}
          placeholderMessage={
            activeTab === "collection"
              ? "Tahsilat logları yakında eklenecek"
              : activeTab === "e-transform"
                ? "E-Dönüşüm logları yakında eklenecek"
                : activeTab === "technical"
                  ? "Teknik destek logları yakında eklenecek"
                  : "Bu özellik yakında eklenecek"
          }
        />
      </div>
    </>
  );
}
