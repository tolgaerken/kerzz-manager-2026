import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useContractCashRegisters } from "../../../hooks/useContractDetail";
import {
  useCreateContractCashRegister,
  useUpdateContractCashRegister,
  useDeleteContractCashRegister
} from "../../../hooks/useContractDetailMutations";
import { useActiveEftPosModels } from "../../../hooks/useEftPosModels";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractCashRegister } from "../../../types";
import { contractCashRegistersColumns } from "../columnDefs";

interface ContractCashRegistersTabProps {
  contractId: string;
}

export function ContractCashRegistersTab({ contractId }: ContractCashRegistersTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractCashRegister | null>(null);

  // Data hooks
  const { data, isLoading } = useContractCashRegisters(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });
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

  const createEmptyRow = useCallback((): ContractCashRegister => ({
    id: crypto.randomUUID(),
    _id: "",
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
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractCashRegister[]) => {
    rows.forEach((row) => {
      const { id, _id, ...data } = row;
      createMutation.mutate(data);
    });
  }, [createMutation]);

  const handlePendingCellChange = useCallback(
    (row: ContractCashRegister, columnId: string, newValue: unknown): ContractCashRegister => {
      const updated = { ...row, [columnId]: newValue };
      if (columnId === "licanceId" && newValue) {
        const selectedLicense = licenses.find((l) => l.id === newValue);
        if (selectedLicense) {
          updated.brand = selectedLicense.brandName;
        }
      }
      return updated;
    },
    [licenses]
  );

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

  const toolbarConfig = useMemo<ToolbarConfig<ContractCashRegister>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !selectedRow || isProcessing,
        variant: "danger"
      }
    ];

    return {
      showSearch: true,
      showExcelExport: true,
      showPdfExport: false,
      showColumnVisibility: true,
      showAddRow: true,
      customButtons
    };
  }, [handleDelete, selectedRow, isProcessing]);

  const cashRegisters = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractCashRegister>
          data={cashRegisters}
          columns={contractCashRegistersColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={createEmptyRow}
          onNewRowSave={handleNewRowSave}
          onPendingCellChange={handlePendingCellChange}
          context={gridContext}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>
    </div>
  );
}
