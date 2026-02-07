import { useMemo } from "react";
import { useContractSupports } from "../../features/contracts/hooks/useContractDetail";
import { useLicenses } from "../../features/licenses/hooks/useLicenses";
import type { ContractSupport } from "../../features/contracts/types";
import { EditableGrid } from "../../features/contracts/components/ContractDetailModal/shared";
import { contractSupportsColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsSupportsGrid() {
  const { data, isLoading } = useContractSupports(undefined, true);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });

  const licenses = useMemo(() => {
    return licensesData?.data
      ?.filter((lic) => lic.id != null)
      .map((lic) => ({
        _id: lic._id,
        id: lic.id,
        brandName: lic.brandName,
        SearchItem: lic.SearchItem || lic.brandName,
      })) || [];
  }, [licensesData]);

  const gridContext = useMemo(
    () => ({ licenses }),
    [licenses]
  );

  const supports = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <EditableGrid<ContractSupport>
        data={supports}
        columns={contractSupportsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        context={gridContext}
      />
    </div>
  );
}
