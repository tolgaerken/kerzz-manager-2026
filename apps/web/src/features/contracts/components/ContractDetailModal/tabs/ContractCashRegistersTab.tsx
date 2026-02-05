import { useState, useCallback } from "react";
import { CreditCard } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractCashRegisters } from "../../../hooks/useContractDetail";
import {
  useCreateContractCashRegister,
  useUpdateContractCashRegister,
  useDeleteContractCashRegister
} from "../../../hooks/useContractDetailMutations";
import type { ContractCashRegister } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractCashRegistersColumns } from "../columnDefs";

interface ContractCashRegistersTabProps {
  contractId: string;
}

export function ContractCashRegistersTab({ contractId }: ContractCashRegistersTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractCashRegister | null>(null);

  const { data, isLoading } = useContractCashRegisters(contractId);
  const createMutation = useCreateContractCashRegister(contractId);
  const updateMutation = useUpdateContractCashRegister(contractId);
  const deleteMutation = useDeleteContractCashRegister(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleAdd = useCallback(() => {
    const newCashRegister: Omit<ContractCashRegister, "_id" | "id"> = {
      contractId,
      brand: "",
      licanceId: "",
      legalId: "",
      model: "",
      type: "",
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

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractCashRegister>) => {
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
    (row: ContractCashRegister | null) => {
      setSelectedRow(row);
    },
    []
  );

  const cashRegisters = data?.data || [];

  if (!isLoading && cashRegisters.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Yazarkasa Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait yazarkasa kaydı bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni yazarkasa eklemek için "Yazarkasa Ekle" butonuna tıklayın.</p>
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
        addLabel="Yazarkasa Ekle"
      />
      <EditableGrid<ContractCashRegister>
        data={cashRegisters}
        columnDefs={contractCashRegistersColumns}
        loading={isLoading}
        getRowId={(row) => row.id || row._id}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        height="400px"
      />
    </div>
  );
}
