import { Cloud } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractSaasTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsSaasGrid } from "./contract-sub-pages/AllRecordsSaasGrid";

export function ContractSaasPage() {
  return (
    <ContractSubItemPageLayout title="SaaS" icon={Cloud}>
      {(contractId) =>
        contractId ? (
          <ContractSaasTab contractId={contractId} />
        ) : (
          <AllRecordsSaasGrid />
        )
      }
    </ContractSubItemPageLayout>
  );
}
