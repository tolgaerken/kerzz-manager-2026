import { useState } from "react";
import { GitBranch, LayoutDashboard, List } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractVersionsTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsVersionsGrid } from "./contract-sub-pages/AllRecordsVersionsGrid";
import { VersionsDashboard } from "../features/contracts/components/VersionsDashboard";

type TabId = "dashboard" | "list";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "list", label: "Liste", icon: List },
];

export function ContractVersionsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Başlık + Tab */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-[var(--color-primary)]" />
          <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
            Versiyonlar
          </h1>
        </div>

        {/* Tab Butonları */}
        <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab İçerikleri */}
      {activeTab === "dashboard" && (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <VersionsDashboard />
        </div>
      )}

      {activeTab === "list" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <ContractSubItemPageLayout title="Versiyonlar" icon={GitBranch}>
            {(contractId) =>
              contractId ? (
                <ContractVersionsTab contractId={contractId} />
              ) : (
                <AllRecordsVersionsGrid />
              )
            }
          </ContractSubItemPageLayout>
        </div>
      )}
    </div>
  );
}
