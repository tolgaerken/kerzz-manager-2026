import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useContractUsers } from "../../../hooks/useContractDetail";
import {
  useCreateContractUser,
  useUpdateContractUser,
  useDeleteContractUser
} from "../../../hooks/useContractDetailMutations";
import type { ContractUser } from "../../../types";
import { contractUsersColumns } from "../columnDefs";

interface ContractUsersTabProps {
  contractId: string;
}

export function ContractUsersTab({ contractId }: ContractUsersTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractUser | null>(null);

  const { data, isLoading } = useContractUsers(contractId);
  const createMutation = useCreateContractUser(contractId);
  const updateMutation = useUpdateContractUser(contractId);
  const deleteMutation = useDeleteContractUser(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractUser => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    name: "",
    email: "",
    gsm: "",
    role: "other",
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractUser[]) => {
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
    (row: ContractUser, columnId: string, newValue: unknown) => {
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
    (row: ContractUser) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractUser>>(() => {
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

  const users = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractUser>
          data={users}
          columns={contractUsersColumns}
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
