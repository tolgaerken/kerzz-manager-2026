import { useState, useCallback } from "react";
import { HeartHandshake } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractSupports } from "../../../hooks/useContractDetail";
import {
  useCreateContractSupport,
  useUpdateContractSupport,
  useDeleteContractSupport
} from "../../../hooks/useContractDetailMutations";
import type { ContractSupport } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractSupportsColumns } from "../columnDefs";

interface ContractSupportsTabProps {
  contractId: string;
}

export function ContractSupportsTab({ contractId }: ContractSupportsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractSupport | null>(null);

  const { data, isLoading } = useContractSupports(contractId);
  const createMutation = useCreateContractSupport(contractId);
  const updateMutation = useUpdateContractSupport(contractId);
  const deleteMutation = useDeleteContractSupport(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleAdd = useCallback(() => {
    const newSupport: Omit<ContractSupport, "_id" | "id"> = {
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
    };
    createMutation.mutate(newSupport);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractSupport>) => {
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
    (row: ContractSupport | null) => {
      setSelectedRow(row);
    },
    []
  );

  const supports = data?.data || [];

  if (!isLoading && supports.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Destek Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <HeartHandshake className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait destek kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni destek eklemek için "Destek Ekle" butonuna tıklayın.</p>
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
        addLabel="Destek Ekle"
      />
      <EditableGrid<ContractSupport>
        data={supports}
        columnDefs={contractSupportsColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        height="400px"
      />
    </div>
  );
}
