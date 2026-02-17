import { useState, useCallback, useMemo } from "react";
import { Trash2, FileText, Calendar, Tag, File } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractDocuments } from "../../../hooks/useContractDetail";
import {
  useCreateContractDocument,
  useUpdateContractDocument,
  useDeleteContractDocument
} from "../../../hooks/useContractDetailMutations";
import type { ContractDocument } from "../../../types";
import { contractDocumentsColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractDocumentsTabProps {
  contractId: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR");
};

export function ContractDocumentsTab({ contractId }: ContractDocumentsTabProps) {
  const isMobile = useIsMobile();
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

  const mutationError =
    updateMutation.error || createMutation.error || deleteMutation.error;

  const errorBanner = mutationError ? (
    <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-3 text-sm text-[var(--color-error)]">
      {mutationError instanceof Error
        ? mutationError.message
        : "İşlem sırasında bir hata oluştu"}
    </div>
  ) : null;

  const documents = data?.data || [];

  // Mobile card renderer
  const renderDocumentCard = useCallback((doc: ContractDocument) => (
    <div
      key={doc.id || doc._id}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-info)]/10 p-1.5">
            <FileText className="h-3.5 w-3.5 text-[var(--color-info)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
              {doc.description || doc.filename || "-"}
            </p>
            {doc.filename && doc.description && (
              <p className="text-[10px] text-[var(--color-muted-foreground)] truncate">
                {doc.filename}
              </p>
            )}
          </div>
        </div>
        {doc.documentVersion && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
            v{doc.documentVersion}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(doc.documentDate)}</span>
        </div>
        {doc.type && (
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Tag className="h-3 w-3" />
            <span className="truncate">{doc.type}</span>
          </div>
        )}
      </div>

      {(doc.licanceId || doc.customerId) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
          {doc.licanceId && (
            <span>Lisans: {doc.licanceId}</span>
          )}
          {doc.customerId && (
            <span>Müşteri: {doc.customerId}</span>
          )}
        </div>
      )}
    </div>
  ), []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {errorBanner}
        <MobileCardList
          data={documents}
          loading={isLoading}
          renderCard={renderDocumentCard}
          emptyMessage="Doküman bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      {errorBanner}
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
