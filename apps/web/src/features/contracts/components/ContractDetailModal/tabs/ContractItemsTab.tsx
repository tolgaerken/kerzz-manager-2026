import { useState, useCallback } from "react";
import { Package } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractItems } from "../../../hooks/useContractDetail";
import {
  useCreateContractItem,
  useUpdateContractItem,
  useDeleteContractItem
} from "../../../hooks/useContractDetailMutations";
import type { ContractItem } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
import { contractItemsColumns } from "../columnDefs";

interface ContractItemsTabProps {
  contractId: string;
}

export function ContractItemsTab({ contractId }: ContractItemsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractItem | null>(null);

  const { data, isLoading } = useContractItems(contractId);
  const createMutation = useCreateContractItem(contractId);
  const updateMutation = useUpdateContractItem(contractId);
  const deleteMutation = useDeleteContractItem(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleAdd = useCallback(() => {
    const newItem: Omit<ContractItem, "_id" | "id"> = {
      contractId,
      itemId: "",
      description: "",
      price: 0,
      old_price: 0,
      qty: 1,
      qtyDynamic: false,
      currency: "tl",
      yearly: false,
      enabled: true,
      expired: false,
      erpId: "",
      editDate: new Date().toISOString(),
      editUser: ""
    };
    createMutation.mutate(newItem);
  }, [contractId, createMutation]);

  const handleDelete = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
      setSelectedRow(null);
    }
  }, [selectedRow, deleteMutation]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractItem>) => {
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
    (row: ContractItem | null) => {
      setSelectedRow(row);
    },
    []
  );

  const items = data?.data || [];

  if (!isLoading && items.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Kalem Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait diğer kalem bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni kalem eklemek için "Kalem Ekle" butonuna tıklayın.</p>
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
        addLabel="Kalem Ekle"
      />
      <div className="flex-1 min-h-0">
        <EditableGrid<ContractItem>
          data={items}
          columnDefs={contractItemsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}
