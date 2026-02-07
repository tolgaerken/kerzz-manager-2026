import { GitBranch } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractVersionsTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsVersionsGrid } from "./contract-sub-pages/AllRecordsVersionsGrid";

export function ContractVersionsPage() {
  return (
    <ContractSubItemPageLayout title="Versiyonlar" icon={GitBranch}>
      {(contractId) =>
        contractId ? (
          <ContractVersionsTab contractId={contractId} />
        ) : (
          <AllRecordsVersionsGrid />
        )
      }
    </ContractSubItemPageLayout>
  );
}
