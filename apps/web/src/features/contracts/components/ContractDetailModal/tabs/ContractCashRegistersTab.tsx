import { useState, useCallback, useMemo } from "react";
import { useContractCashRegisters } from "../../../hooks/useContractDetail";
import {
  useCreateContractCashRegister,
  useUpdateContractCashRegister,
  useDeleteContractCashRegister
} from "../../../hooks/useContractDetailMutations";
import { useActiveEftPosModels } from "../../../hooks/useEftPosModels";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractCashRegister } from "../../../types";
import { EditableGrid } from "../shared";
import { contractCashRegistersColumns } from "../columnDefs";

interface ContractCashRegistersTabProps {
  contractId: string;
}

export function ContractCashRegistersTab({ contractId }: ContractCashRegistersTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractCashRegister | null>(null);

  // Data hooks
  const { data, isLoading } = useContractCashRegisters(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc" });
  const { data: eftPosModelsData } = useActiveEftPosModels();

  // Mutation hooks
  const createMutation = useCreateContractCashRegister(contractId);
  const updateMutation = useUpdateContractCashRegister(contractId);
  const deleteMutation = useDeleteContractCashRegister(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Lisansları grid için hazırla
  const licenses = useMemo(() => {
    return licensesData?.data
      ?.filter((lic) => lic.id != null)
      .map((lic) => ({
        _id: lic._id,
        id: lic.id,
        brandName: lic.brandName,
        SearchItem: lic.SearchItem || lic.brandName
      })) || [];
  }, [licensesData]);

  // EftPos modellerini grid için hazırla
  const eftPosModels = useMemo(() => {
    return (
      eftPosModelsData?.data?.map((model) => ({
        id: model.id,
        name: model.name
      })) || []
    );
  }, [eftPosModelsData]);

  // Lisans seçildiğinde brand'ı güncelle
  const handleLicenseSelect = useCallback(
    (rowId: string, license: { id: string; brandName: string } | null) => {
      if (rowId) {
        updateMutation.mutate({
          id: rowId,
          data: {
            brand: license?.brandName || "",
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation]
  );

  // Grid context
  const gridContext = useMemo(
    () => ({
      licenses,
      eftPosModels,
      onLicenseSelect: handleLicenseSelect
    }),
    [licenses, eftPosModels, handleLicenseSelect]
  );

  const handleAdd = useCallback(() => {
    const newCashRegister: Omit<ContractCashRegister, "_id" | "id"> = {
      contractId,
      brand: "",
      licanceId: "",
      legalId: "",
      model: "",
      type: "tsm",
      price: 0,
      old_price: 0,
      currency: "tl",
      yearly: false,
      enabled: true,
      expired: false,
      eftPosActive: false,
      folioClose: false,
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newCashRegister);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractCashRegister, columnId: string, newValue: unknown) => {
      if (row?.id) {
        const { _id, id, contractId: cId, ...updateData } = row;

        if (columnId === "licanceId" && newValue) {
          const selectedLicense = licenses.find((l) => l.id === newValue);
          if (selectedLicense) {
            updateData.brand = selectedLicense.brandName;
          }
        }

        updateMutation.mutate({
          id: row.id,
          data: {
            ...updateData,
            [columnId]: newValue,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation, licenses]
  );

  const handleRowClick = useCallback(
    (row: ContractCashRegister) => {
      setSelectedRow(row);
    },
    []
  );

  const cashRegisters = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractCashRegister>
        data={cashRegisters}
        columns={contractCashRegistersColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
        addLabel="Yazarkasa Ekle"
        context={gridContext}
      />
    </div>
  );
}
