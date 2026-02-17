import { useState, useCallback, useMemo, useEffect } from "react";
import {
  X,
  LayoutDashboard,
  Users,
  HeartHandshake,
  GitBranch,
  CreditCard,
  Cloud,
  Package,
  FileText,
  Receipt,
  MessageSquare
} from "lucide-react";
import type { Contract } from "../../types";
import {
  ContractSummaryTab,
  ContractUsersTab,
  ContractSupportsTab,
  ContractVersionsTab,
  ContractCashRegistersTab,
  ContractSaasTab,
  ContractItemsTab,
  ContractDocumentsTab,
  ContractPaymentsTab
} from "./tabs";
import {
  useContractCashRegisters,
  useContractDocuments,
  useContractItems,
  useContractPayments,
  useContractSaas,
  useContractSupports,
  useContractUsers,
  useContractVersions
} from "../../hooks/useContractDetail";
import { useLogPanelStore } from "../../../manager-log/store/logPanelStore";

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onContractUpdated?: (contract: Contract) => void;
  /** Modal açıldığında başlangıçta gösterilecek tab */
  initialTab?: string;
}

type TabId =
  | "summary"
  | "users"
  | "supports"
  | "versions"
  | "cash-registers"
  | "saas"
  | "items"
  | "documents"
  | "payments";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "summary", label: "Özet", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "users", label: "Kullanıcılar", icon: <Users className="w-4 h-4" /> },
  { id: "supports", label: "Destekler", icon: <HeartHandshake className="w-4 h-4" /> },
  { id: "versions", label: "Versiyon", icon: <GitBranch className="w-4 h-4" /> },
  { id: "cash-registers", label: "Yazarkasalar", icon: <CreditCard className="w-4 h-4" /> },
  { id: "saas", label: "SaaS", icon: <Cloud className="w-4 h-4" /> },
  { id: "items", label: "Diğer", icon: <Package className="w-4 h-4" /> },
  { id: "documents", label: "Dökümanlar", icon: <FileText className="w-4 h-4" /> },
  { id: "payments", label: "Ödemeler", icon: <Receipt className="w-4 h-4" /> }
];

export function ContractDetailModal({
  isOpen,
  onClose,
  contract,
  onContractUpdated,
  initialTab
}: ContractDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || "summary");
  const [loadedTabs, setLoadedTabs] = useState<Record<TabId, boolean>>({ summary: true } as Record<TabId, boolean>);
  const { openPanel } = useLogPanelStore();

  // initialTab değiştiğinde tab'ı güncelle
  useEffect(() => {
    if (initialTab && isOpen) {
      const tabId = initialTab as TabId;
      setActiveTab(tabId);
      setLoadedTabs((prev) => ({ ...prev, [tabId]: true }));
    }
  }, [initialTab, isOpen]);
  const { data: usersData } = useContractUsers(contract.id);
  const { data: supportsData } = useContractSupports(contract.id);
  const { data: versionsData } = useContractVersions(contract.id);
  const { data: cashRegistersData } = useContractCashRegisters(contract.id);
  const { data: saasData } = useContractSaas(contract.id);
  const { data: itemsData } = useContractItems(contract.id);
  const { data: documentsData } = useContractDocuments(contract.id);
  const { data: paymentsData } = useContractPayments(contract.id);

  const tabCounts = useMemo<Record<TabId, number>>(() => ({
    summary: 0,
    users: usersData?.total ?? 0,
    supports: supportsData?.total ?? 0,
    versions: versionsData?.total ?? 0,
    "cash-registers": cashRegistersData?.total ?? 0,
    saas: saasData?.total ?? 0,
    items: itemsData?.total ?? 0,
    documents: documentsData?.total ?? 0,
    payments: paymentsData?.total ?? 0
  }), [
    usersData,
    supportsData,
    versionsData,
    cashRegistersData,
    saasData,
    itemsData,
    documentsData,
    paymentsData
  ]);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setLoadedTabs((prev) => ({ ...prev, [tabId]: true }));
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset to summary tab on close
    setActiveTab("summary");
  }, [onClose]);

  const handleOpenLogs = useCallback(() => {
    openPanel({
      customerId: contract.customerId,
      contextType: "contract",
      contextId: contract.id,
      title: `${contract.brand} - Loglar`
    });
  }, [openPanel, contract]);

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <ContractSummaryTab contract={contract} onContractUpdated={onContractUpdated} />;
      case "users":
        return loadedTabs.users ? <ContractUsersTab contractId={contract.id} /> : null;
      case "supports":
        return loadedTabs.supports ? <ContractSupportsTab contractId={contract.id} /> : null;
      case "versions":
        return loadedTabs.versions ? <ContractVersionsTab contractId={contract.id} /> : null;
      case "cash-registers":
        return loadedTabs["cash-registers"] ? <ContractCashRegistersTab contractId={contract.id} /> : null;
      case "saas":
        return loadedTabs.saas ? <ContractSaasTab contractId={contract.id} /> : null;
      case "items":
        return loadedTabs.items ? <ContractItemsTab contractId={contract.id} /> : null;
      case "documents":
        return loadedTabs.documents ? <ContractDocumentsTab contractId={contract.id} /> : null;
      case "payments":
        return loadedTabs.payments ? <ContractPaymentsTab contractId={contract.id} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal - Full Screen */}
      <div className="relative z-10 w-full h-full bg-surface shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-foreground truncate">
              {contract.brand}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {contract.company} • #{contract.no}
            </p>
          </div>
          <button
            onClick={handleOpenLogs}
            className="ml-2 md:ml-4 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
            title="Logları Görüntüle"
          >
            <MessageSquare className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-2 md:px-4 overflow-x-auto shrink-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id !== "summary" && tabCounts[tab.id] > 0 && (
                <span className="px-1 md:px-1.5 py-0.5 text-[10px] md:text-xs font-medium rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 md:px-6 py-3 md:py-4">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-border shrink-0">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-foreground bg-surface-elevated rounded-lg hover:bg-border transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
