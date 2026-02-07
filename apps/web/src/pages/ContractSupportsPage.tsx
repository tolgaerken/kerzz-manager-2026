import { HeartHandshake } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractSupportsTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsSupportsGrid } from "./contract-sub-pages/AllRecordsSupportsGrid";

export function ContractSupportsPage() {
  return (
    <ContractSubItemPageLayout title="Destekler" icon={HeartHandshake}>
      {(contractId) =>
        contractId ? (
          <ContractSupportsTab contractId={contractId} />
        ) : (
          <AllRecordsSupportsGrid />
        )
      }
    </ContractSubItemPageLayout>
  );
}
