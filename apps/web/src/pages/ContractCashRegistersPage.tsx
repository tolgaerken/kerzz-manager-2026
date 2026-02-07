import { CreditCard } from "lucide-react";
import { ContractSubItemPageLayout } from "../features/contracts/components/ContractSubItemPageLayout";
import { ContractCashRegistersTab } from "../features/contracts/components/ContractDetailModal/tabs";
import { AllRecordsCashRegistersGrid } from "./contract-sub-pages/AllRecordsCashRegistersGrid";

export function ContractCashRegistersPage() {
  return (
    <ContractSubItemPageLayout title="Yazarkasalar" icon={CreditCard}>
      {(contractId) =>
        contractId ? (
          <ContractCashRegistersTab contractId={contractId} />
        ) : (
          <AllRecordsCashRegistersGrid />
        )
      }
    </ContractSubItemPageLayout>
  );
}
