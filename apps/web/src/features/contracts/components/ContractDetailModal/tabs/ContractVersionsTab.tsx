import { useState, useCallback } from "react";
import { useContractVersions } from "../../../hooks/useContractDetail";
import {
  useCreateContractVersion,
  useUpdateContractVersion,
  useDeleteContractVersion
} from "../../../hooks/useContractDetailMutations";
import type { ContractVersion } from "../../../types";
import { EditableGrid } from "../shared";
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

  const handleAdd = useCallback(() => {
    const newVersion: Omit<ContractVersion, "_id" | "id"> = {
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
    };
    createMutation.mutate(newVersion);
  }, [contractId, createMutation]);

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

  const versions = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractVersion>
        data={versions}
        columns={contractVersionsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChange={handleCellValueChange}
        onRowClick={handleRowClick}
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
        addLabel="Versiyon Ekle"
      />
    </div>
  );
}
