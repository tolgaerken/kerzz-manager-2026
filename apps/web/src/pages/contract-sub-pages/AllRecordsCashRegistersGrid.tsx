import { useMemo } from "react";
import { Grid } from "@kerzz/grid";
import { useContractCashRegisters } from "../../features/contracts/hooks/useContractDetail";
import { useActiveEftPosModels } from "../../features/contracts/hooks/useEftPosModels";
import { useLicenses } from "../../features/licenses/hooks/useLicenses";
import type { ContractCashRegister } from "../../features/contracts/types";
import { contractCashRegistersColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";

export function AllRecordsCashRegistersGrid() {
  const { data, isLoading } = useContractCashRegisters(undefined, true);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });
  const { data: eftPosModelsData } = useActiveEftPosModels();

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

  const eftPosModels = useMemo(() => {
    return (
      eftPosModelsData?.data?.map((model) => ({
        id: model.id,
        name: model.name,
      })) || []
    );
  }, [eftPosModelsData]);

  const gridContext = useMemo(
    () => ({ licenses, eftPosModels }),
    [licenses, eftPosModels]
  );

  const cashRegisters = data?.data || [];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-0">
        <Grid<ContractCashRegister>
          data={cashRegisters}
          columns={contractCashRegistersColumns}
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
