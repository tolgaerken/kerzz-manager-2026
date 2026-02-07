import { Grid } from "@kerzz/grid";
import { useContractDocuments } from "../../features/contracts/hooks/useContractDetail";
import type { ContractDocument } from "../../features/contracts/types";
import { contractDocumentsColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsDocumentsGrid() {
  const { data, isLoading } = useContractDocuments(undefined, true);

  const documents = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-0">
        <Grid<ContractDocument>
          data={documents}
          columns={contractDocumentsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          height="100%"
          locale="tr"
        />
      </div>
    </div>
  );
}
