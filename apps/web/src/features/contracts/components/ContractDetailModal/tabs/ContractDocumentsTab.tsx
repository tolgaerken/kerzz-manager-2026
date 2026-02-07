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

  const handleAdd = useCallback(() => {
    const newDocument: Omit<ContractDocument, "_id" | "id"> = {
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
    };
    createMutation.mutate(newDocument);
  }, [contractId, createMutation]);

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
        onAdd={handleAdd}
        onDelete={handleDelete}
        canDelete={!!selectedRow}
        processing={isProcessing}
        addLabel="Döküman Ekle"
      />
    </div>
  );
}
