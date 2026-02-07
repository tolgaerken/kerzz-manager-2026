import { useState, useCallback } from "react";
import { useContractUsers } from "../../../hooks/useContractDetail";
import {
  useCreateContractUser,
  useUpdateContractUser,
  useDeleteContractUser
} from "../../../hooks/useContractDetailMutations";
import type { ContractUser } from "../../../types";
import { EditableGrid } from "../shared";
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
    id: "",
    _id: "",
    contractId,
    name: "",
    email: "",
    gsm: "",
    role: "other",
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleSaveNewRows = useCallback((rows: ContractUser[]) => {
    rows.forEach((row) => {
      const { _id, id, ...data } = row;
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

  const users = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractUser>
        data={users}
        columns={contractUsersColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        createEmptyRow={createEmptyRow}
        onSaveNewRows={handleSaveNewRows}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
      />
    </div>
  );
}
