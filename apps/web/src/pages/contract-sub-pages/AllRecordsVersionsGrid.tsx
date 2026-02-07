import { useContractVersions } from "../../features/contracts/hooks/useContractDetail";
import type { ContractVersion } from "../../features/contracts/types";
import { EditableGrid } from "../../features/contracts/components/ContractDetailModal/shared";
import { contractVersionsColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsVersionsGrid() {
  const { data, isLoading } = useContractVersions(undefined, true);

  const versions = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <EditableGrid<ContractVersion>
        data={versions}
        columns={contractVersionsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
      />
    </div>
  );
}
