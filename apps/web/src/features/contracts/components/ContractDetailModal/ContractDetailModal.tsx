import { useState, useCallback } from "react";
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
  Receipt
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

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
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
  contract
}: ContractDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [loadedTabs, setLoadedTabs] = useState<Record<TabId, boolean>>({ summary: true } as Record<TabId, boolean>);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setLoadedTabs((prev) => ({ ...prev, [tabId]: true }));
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset to summary tab on close
    setActiveTab("summary");
  }, [onClose]);

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <ContractSummaryTab contract={contract} />;
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

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl mx-4 bg-surface rounded-lg shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {contract.brand}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {contract.company} • Kontrat No: {contract.no}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-foreground bg-surface-elevated rounded-lg hover:bg-border transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
