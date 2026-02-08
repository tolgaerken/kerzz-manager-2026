import { useState, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelinePayment } from "../../types/pipeline.types";
import { generateTempId } from "../../utils/lineItemCalculations";
import { paymentItemsColumns } from "../../columnDefs/paymentItemsColumns";

type PaymentItem = Partial<PipelinePayment>;

interface PaymentItemsTableProps {
  items: PaymentItem[];
  onItemsChange: (items: PaymentItem[]) => void;
  readOnly?: boolean;
}

export function PaymentItemsTable({
  items,
  onItemsChange,
  readOnly = false,
}: PaymentItemsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCellValueChange = useCallback(
    (row: PaymentItem, columnId: string, newValue: unknown) => {
      onItemsChange(
        items.map((item) =>
          item._id === row._id ? { ...item, [columnId]: newValue } : item,
        ),
      );
    },
    [items, onItemsChange],
  );

  const createEmptyRow = useCallback(
    (): PaymentItem => ({
      _id: generateTempId(),
      amount: 0,
      currency: "tl",
      paymentDate: new Date().toISOString().split("T")[0],
      method: "bank-transfer",
      description: "",
      isPaid: false,
      invoiceNo: "",
    }),
    [],
  );

  const handleNewRowsSave = useCallback(
    (newRows: PaymentItem[]) => {
      onItemsChange([...items, ...newRows]);
    },
    [items, onItemsChange],
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    onItemsChange(items.filter((i) => i._id !== selectedId));
    setSelectedId(null);
  }, [selectedId, items, onItemsChange]);

  const handleRowClick = useCallback((row: PaymentItem) => {
    setSelectedId(row._id || null);
  }, []);

  const toolbarConfig = useMemo<ToolbarConfig<PaymentItem>>(() => {
    const customButtons: ToolbarButtonConfig[] = [];

    if (!readOnly) {
      customButtons.push({
        id: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        onClick: handleDelete,
        disabled: !selectedId,
        variant: "danger",
      });
    }

    return {
      showSearch: false,
      showExcelExport: false,
      showPdfExport: false,
      showColumnVisibility: false,
      showAddRow: !readOnly,
      customButtons,
    };
  }, [readOnly, handleDelete, selectedId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Grid<PaymentItem>
          data={items}
          columns={paymentItemsColumns}
          getRowId={(row) => row._id || ""}
          onCellValueChange={handleCellValueChange}
          onRowClick={handleRowClick}
          createEmptyRow={readOnly ? undefined : createEmptyRow}
          onNewRowSave={handleNewRowsSave}
          height="100%"
          locale="tr"
          toolbar={toolbarConfig}
          selectionMode="single"
        />
      </div>
    </div>
  );
}
