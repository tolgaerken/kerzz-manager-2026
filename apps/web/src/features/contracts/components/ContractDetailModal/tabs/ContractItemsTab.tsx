import { useState, useCallback, useMemo } from "react";
import { Trash2, Package, CircleDollarSign, CheckCircle2, XCircle, Hash, FileText } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../../hooks/useIsMobile";
import { useContractItems } from "../../../hooks/useContractDetail";
import {
  useCreateContractItem,
  useUpdateContractItem,
  useDeleteContractItem
} from "../../../hooks/useContractDetailMutations";
import type { ContractItem } from "../../../types";
import { contractItemsColumns } from "../columnDefs";
import { MobileCardList } from "./shared";

interface ContractItemsTabProps {
  contractId: string;
}

const formatCurrency = (value: number, currency: string = "tl") => {
  const currencyMap: Record<string, string> = { tl: "TRY", usd: "USD", eur: "EUR" };
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyMap[currency] || "TRY"
  }).format(value);
};

export function ContractItemsTab({ contractId }: ContractItemsTabProps) {
  const isMobile = useIsMobile();
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
    id: crypto.randomUUID(),
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
    startDate: new Date().toISOString(),
    activated: false,
    activatedAt: undefined,
    editDate: new Date().toISOString(),
    editUser: ""
  }), [contractId]);

  const handleNewRowSave = useCallback((rows: ContractItem[]) => {
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

  const toolbarConfig = useMemo<ToolbarConfig<ContractItem>>(() => {
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

  const items = data?.data || [];

  // Mobile card renderer
  const renderItemCard = useCallback((item: ContractItem) => {
    const total = item.price * item.qty;
    
    return (
      <div
        key={item.id || item._id}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[var(--color-warning)]/10 p-1.5">
              <Package className="h-3.5 w-3.5 text-[var(--color-warning)]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--color-foreground)] truncate">
                {item.description || item.itemId || "-"}
              </p>
              {item.erpId && (
                <p className="text-[10px] text-[var(--color-muted-foreground)]">
                  ERP: {item.erpId}
                </p>
              )}
            </div>
          </div>
          {item.enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)]" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-[var(--color-error)]" />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <FileText className="h-3 w-3" />
            <span>Birim: {formatCurrency(item.price, item.currency)}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
            <Hash className="h-3 w-3" />
            <span>Adet: {item.qty}{item.qtyDynamic ? " (Dinamik)" : ""}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              item.yearly 
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                : "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
            }`}>
              {item.yearly ? "Yıllık" : "Aylık"}
            </span>
            {item.expired && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
                Süresi Dolmuş
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 font-medium text-sm text-[var(--color-foreground)]">
            <CircleDollarSign className="h-3.5 w-3.5" />
            <span>{formatCurrency(total, item.currency)}</span>
          </div>
        </div>
      </div>
    );
  }, []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileCardList
          data={items}
          loading={isLoading}
          renderCard={renderItemCard}
          emptyMessage="Kalem bulunamadı"
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<ContractItem>
          data={items}
          columns={contractItemsColumns}
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
