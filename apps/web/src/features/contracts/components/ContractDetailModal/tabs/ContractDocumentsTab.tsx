import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useContractDocuments } from "../../../hooks/useContractDetail";
import {
  useCreateContractDocument,
  useUpdateContractDocument,
  useDeleteContractDocument
} from "../../../hooks/useContractDetailMutations";
import type { ContractDocument } from "../../../types";
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
    id: crypto.randomUUID(),
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

  const handleNewRowSave = useCallback((rows: ContractDocument[]) => {
    rows.forEach((row) => {
      const { id, _id, ...data } = row;
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

  const toolbarConfig = useMemo<ToolbarConfig<ContractDocument>>(() => {
    const customButtons: ToolbarButtonConfig[] = [
      {
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !selectedRow || isProcessing,
        variant: "danger"
      }
    ];

    return {
      showSearch: true,
      showExcelExport: true,
      showPdfExport: false,
      showColumnVisibility: true,
      showAddRow: true,
      customButtons
    };
  }, [handleDelete, selectedRow, isProcessing]);

  const documents = data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractDocument>
          data={documents}
          columns={contractDocumentsColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={createEmptyRow}
          onNewRowSave={handleNewRowSave}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>
    </div>
  );
}
