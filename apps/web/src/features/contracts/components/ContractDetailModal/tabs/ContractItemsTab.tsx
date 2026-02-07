import { useState, useCallback } from "react";
import { useContractItems } from "../../../hooks/useContractDetail";
import {
  useCreateContractItem,
  useUpdateContractItem,
  useDeleteContractItem
} from "../../../hooks/useContractDetailMutations";
import type { ContractItem } from "../../../types";
import { EditableGrid } from "../shared";
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

  const createEmptyRow = useCallback((): ContractItem => ({
    id: "",
    _id: "",
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
  }), [contractId]);

  const handleSaveNewRows = useCallback((rows: ContractItem[]) => {
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
    (row: ContractItem, columnId: string, newValue: unknown) => {
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
    (row: ContractItem) => {
      setSelectedRow(row);
    },
    []
  );

  const items = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractItem>
        data={items}
        columns={contractItemsColumns}
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
