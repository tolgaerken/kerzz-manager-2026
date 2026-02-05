import { useState, useCallback } from "react";
import { Users } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractUsers } from "../../../hooks/useContractDetail";
import {
  useCreateContractUser,
  useUpdateContractUser,
  useDeleteContractUser
} from "../../../hooks/useContractDetailMutations";
import type { ContractUser } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
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

  const handleAdd = useCallback(() => {
    const newUser: Omit<ContractUser, "_id" | "id"> = {
      contractId,
      name: "",
      email: "",
      gsm: "",
      role: "other",
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newUser);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractUser>) => {
      if (event.data?.id) {
        const { _id, id, contractId: cId, ...updateData } = event.data;
        updateMutation.mutate({
          id: event.data.id,
          data: {
            ...updateData,
            editDate: new Date().toISOString()
          }
        });
      }
    },
    [updateMutation]
  );

  const handleSelectionChanged = useCallback(
    (row: ContractUser | null) => {
      setSelectedRow(row);
    },
    []
  );

  const users = data?.data || [];

  if (!isLoading && users.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Kullanıcı Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait kullanıcı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni kullanıcı eklemek için "Kullanıcı Ekle" butonuna tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DetailGridToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        loading={isProcessing}
        addLabel="Kullanıcı Ekle"
      />
      <div className="flex-1 min-h-0">
        <EditableGrid<ContractUser>
          data={users}
          columnDefs={contractUsersColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}
