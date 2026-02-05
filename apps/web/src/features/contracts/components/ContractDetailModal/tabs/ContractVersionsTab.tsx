import { useState, useCallback } from "react";
import { GitBranch } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractVersions } from "../../../hooks/useContractDetail";
import {
  useCreateContractVersion,
  useUpdateContractVersion,
  useDeleteContractVersion
} from "../../../hooks/useContractDetailMutations";
import type { ContractVersion } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
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

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractVersion>) => {
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
    (row: ContractVersion | null) => {
      setSelectedRow(row);
    },
    []
  );

  const versions = data?.data || [];

  if (!isLoading && versions.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Versiyon Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait versiyon kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni versiyon eklemek için "Versiyon Ekle" butonuna tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DetailGridToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        loading={isProcessing}
        addLabel="Versiyon Ekle"
      />
      <EditableGrid<ContractVersion>
        data={versions}
        columnDefs={contractVersionsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        height="400px"
      />
    </div>
  );
}
