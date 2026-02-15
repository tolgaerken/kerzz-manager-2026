import { useState, useCallback, useMemo } from "react";
import { Trash2, GitBranch, Store, CircleDollarSign, CheckCircle2, XCircle, Tag } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractVersions } from "../../../hooks/useContractDetail";
import {
  useCreateContractVersion,
  useUpdateContractVersion,
  useDeleteContractVersion
} from "../../../hooks/useContractDetailMutations";
import type { ContractVersion } from "../../../types";
import { contractVersionsColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractVersionsTabProps {
  contractId: string;
}

const formatCurrency = (value: number, currency: string = "tl") => {
  const currencyMap: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY"
  }).format(value);
};

export function ContractVersionsTab({ contractId }: ContractVersionsTabProps) {
  const isMobile = useIsMobile();
  const [selectedRow, setSelectedRow] = useState<ContractVersion | null>(null);

  const { data, isLoading } = useContractVersions(contractId);
  const createMutation = useCreateContractVersion(contractId);
  const updateMutation = useUpdateContractVersion(contractId);
  const deleteMutation = useDeleteContractVersion(contractId);

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const createEmptyRow = useCallback((): ContractVersion => ({
    id: crypto.randomUUID(),
    _id: "",
    contractId,
    brand: "",
    licanceId: "",
    price: 0,
    old_price: 0,
    currency: "tl",
    type: "",
    enabled: true,
    expired: false,
    startDate: new Date().toISOString(),
    activated: false,
    activatedAt: undefined,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractVersion[]) => {
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
    (row: ContractVersion, columnId: string, newValue: unknown) => {
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
    (row: ContractVersion) => {
      setSelectedRow(row);
    },
    []
  );

  const toolbarConfig = useMemo<ToolbarConfig<ContractVersion>>(() => {
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

  const versions = data?.data || [];

  // Mobile card renderer
  const renderVersionCard = useCallback((version: ContractVersion) => (
    <div
      key={version.id || version._id}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-info)]/10 p-1.5">
            <GitBranch className="h-3.5 w-3.5 text-[var(--color-info)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
              {version.brand || "-"}
            </p>
            {version.type && (
              <p className="text-[10px] text-[var(--color-muted-foreground)]">{version.type}</p>
            )}
          </div>
        </div>
        {version.enabled ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />
        )}
      </div>
      
      <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] mb-2">
        <Store className="h-3 w-3" />
        <span>Lisans: {version.licanceId || "-"}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          {version.expired && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
              Süresi Dolmuş
            </span>
          )}
          {version.old_price > 0 && version.old_price !== version.price && (
            <span className="text-[10px] line-through text-[var(--color-muted-foreground)]">
              {formatCurrency(version.old_price, version.currency)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 font-medium text-sm text-[var(--color-foreground)]">
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>{formatCurrency(version.price, version.currency)}</span>
        </div>
      </div>
    </div>
  ), []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileCardList
          data={versions}
          loading={isLoading}
          renderCard={renderVersionCard}
          emptyMessage="Versiyon kaydı bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractVersion>
          data={versions}
          columns={contractVersionsColumns}
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
