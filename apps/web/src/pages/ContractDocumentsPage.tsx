import { FileText } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractDocumentsTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsDocumentsGrid } from "./contract-sub-pages/AllRecordsDocumentsGrid";

export function ContractDocumentsPage() {
  return (
    <ContractSubItemPageLayout title="Dökümanlar" icon={FileText}>
      {(contractId) =>
        contractId ? (
          <ContractDocumentsTab contractId={contractId} />
        ) : (
          <AllRecordsDocumentsGrid />
        )
      }
    </ContractSubItemPageLayout>
  );
}
