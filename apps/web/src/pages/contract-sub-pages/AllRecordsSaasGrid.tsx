import { useMemo } from "react";
import { Grid } from "@kerzz/grid";
import { useContractSaas } from "../../features/contracts/hooks/useContractDetail";
import { useLicenses } from "../../features/licenses/hooks/useLicenses";
import type { ContractSaas } from "../../features/contracts/types";
import { contractSaasColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsSaasGrid() {
  const { data, isLoading } = useContractSaas(undefined, true);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });

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

  const saasItems = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-0">
        <Grid<ContractSaas>
          data={saasItems}
          columns={contractSaasColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          context={gridContext}
          height="100%"
          locale="tr"
        />
      </div>
    </div>
  );
}
