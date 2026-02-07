import { useState, useCallback } from "react";
import { useContractDocuments } from "../../../hooks/useContractDetail";
import {
  useCreateContractDocument,
  useUpdateContractDocument,
  useDeleteContractDocument
} from "../../../hooks/useContractDetailMutations";
import type { ContractDocument } from "../../../types";
import { EditableGrid } from "../shared";
import { contractDocumentsColumns } from "../columnDefs";

interface ContractDocumentsTabProps {
  contractId: string;
}

export function ContractDocumentsTab({ contractId }: ContractDocumentsTabProps) {
  const [selectedRow, setSelectedRow] = useState<ContractDocument | null>(null);

  const { data, isLoading } = useContractDocuments(contractId);
  const createMutation = useCreateContractDocument(contractId);
  const updateMutation = useUpdateContractDocument(contractId);
  const deleteMutation = useDeleteContractDocument(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractDocument => ({
    id: "",
    _id: "",
    contractId,
    description: "",
    filename: "",
    type: "",
    documentDate: new Date().toISOString(),
    userId: "",
    saleId: "",
    offerId: "",
    customerId: "",
    licanceId: "",
    documentVersion: "1",
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleSaveNewRows = useCallback((rows: ContractDocument[]) => {
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
    (row: ContractDocument, columnId: string, newValue: unknown) => {
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
    (row: ContractDocument) => {
      setSelectedRow(row);
    },
    []
  );

  const documents = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <EditableGrid<ContractDocument>
        data={documents}
        columns={contractDocumentsColumns}
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
