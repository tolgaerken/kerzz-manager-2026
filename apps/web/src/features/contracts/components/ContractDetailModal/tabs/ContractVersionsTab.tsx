import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useContractVersions } from "../../../hooks/useContractDetail";
import {
  useCreateContractVersion,
  useUpdateContractVersion,
  useDeleteContractVersion
} from "../../../hooks/useContractDetailMutations";
import type { ContractVersion } from "../../../types";
import { contractVersionsColumns } from "../columnDefs";

interface ContractVersionsTabProps {
  contractId: string;
}

export function ContractVersionsTab({ contractId }: ContractVersionsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractVersion | null>(null);

  const { data, isLoading } = useContractVersions(contractId);
  const createMutation = useCreateContractVersion(contractId);
  const updateMutation = useUpdateContractVersion(contractId);
  const deleteMutation = useDeleteContractVersion(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractVersion => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    price: 0,
    old_price: 0,
    currency: "tl",
    type: "",
    enabled: true,
    expired: false,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractVersion[]) => {
    rows.forEach((row) => {
      const { id, _id, ...data } = row;
      createMutation.mutate(data);
    });
  }, [createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChange = useCallback(
    (row: ContractVersion, columnId: string, newValue: unknown) => {
      if (row?.id) {
        const { _id, id, contractId: cId, ...updateData } = row;
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
    [updateMutation]
  );

  const handleRowClick = useCallback(
    (row: ContractVersion) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractVersion>>(() => {
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

  const versions = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractVersion>
          data={versions}
          columns={contractVersionsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={createEmptyRow}
          onNewRowSave={handleNewRowSave}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>
    </div>
  );
}
