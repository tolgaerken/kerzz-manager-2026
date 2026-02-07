import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useContractSupports } from "../../../hooks/useContractDetail";
import {
  useCreateContractSupport,
  useUpdateContractSupport,
  useDeleteContractSupport
} from "../../../hooks/useContractDetailMutations";
import { useLicenses } from "../../../../licenses/hooks/useLicenses";
import type { ContractSupport } from "../../../types";
import { contractSupportsColumns } from "../columnDefs";

interface ContractSupportsTabProps {
  contractId: string;
}

export function ContractSupportsTab({ contractId }: ContractSupportsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractSupport | null>(null);

  // Data hooks
  const { data, isLoading } = useContractSupports(contractId);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });

  // Mutation hooks
  const createMutation = useCreateContractSupport(contractId);
  const updateMutation = useUpdateContractSupport(contractId);
  const deleteMutation = useDeleteContractSupport(contractId);

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
      onLicenseSelect: handleLicenseSelect
    }),
    [licenses, handleLicenseSelect]
  );

  const createEmptyRow = useCallback((): ContractSupport => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    price: 0,
    old_price: 0,
    currency: "tl",
    type: "",
    yearly: false,
    enabled: true,
    blocked: false,
    expired: false,
    lastOnlineDay: 0,
    calulatedPrice: 0,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractSupport[]) => {
    rows.forEach((row) => {
      const { id, _id, ...data } = row;
      createMutation.mutate(data);
    });
  }, [createMutation]);

  const handlePendingCellChange = useCallback(
    (row: ContractSupport, columnId: string, newValue: unknown): ContractSupport => {
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
    (row: ContractSupport, columnId: string, newValue: unknown) => {
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
    (row: ContractSupport) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractSupport>>(() => {
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

  const supports = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractSupport>
          data={supports}
          columns={contractSupportsColumns}
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
