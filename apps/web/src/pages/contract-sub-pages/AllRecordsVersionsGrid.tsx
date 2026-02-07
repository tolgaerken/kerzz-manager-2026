import { Grid } from "@kerzz/grid";
import { useContractVersions } from "../../features/contracts/hooks/useContractDetail";
import type { ContractVersion } from "../../features/contracts/types";
import { contractVersionsColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsVersionsGrid() {
  const { data, isLoading } = useContractVersions(undefined, true);

  const versions = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-0">
        <Grid<ContractVersion>
          data={versions}
          columns={contractVersionsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          height="100%"
          locale="tr"
        />
      </div>
    </div>
  );
}
