import { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import type { CellValueChangedEvent } from "ag-grid-community";
import { useContractDocuments } from "../../../hooks/useContractDetail";
import {
  useCreateContractDocument,
  useUpdateContractDocument,
  useDeleteContractDocument
} from "../../../hooks/useContractDetailMutations";
import type { ContractDocument } from "../../../types";
import { EditableGrid, DetailGridToolbar } from "../shared";
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

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<ContractDocument>) => {
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
    (row: ContractDocument | null) => {
      setSelectedRow(row);
    },
    []
  );

  const documents = data?.data || [];

  if (!isLoading && documents.length === 0 && !createMutation.isPending) {
    return (
      <div className="flex flex-col h-full">
        <DetailGridToolbar
          onAdd={handleAdd}
          onDelete={handleDelete}
          canDelete={false}
          loading={isProcessing}
          addLabel="Döküman Ekle"
        />
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Bu kontrata ait döküman bulunmuyor.</p>
          <p className="text-sm mt-1">Yeni döküman eklemek için "Döküman Ekle" butonuna tıklayın.</p>
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
        addLabel="Döküman Ekle"
      />
      <div className="flex-1 min-h-0">
        <EditableGrid<ContractDocument>
          data={documents}
          columnDefs={contractDocumentsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}
