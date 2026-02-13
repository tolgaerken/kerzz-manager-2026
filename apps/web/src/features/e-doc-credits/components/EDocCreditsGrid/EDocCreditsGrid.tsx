import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { MessageSquare, Receipt } from "lucide-react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef, ToolbarButtonConfig } from "@kerzz/grid";
import { eDocCreditColumnDefs } from "./columnDefs";
import type { EDocCreditItem } from "../../types/eDocCredit.types";
import { useLogPanelStore } from "../../../manager-log";
import { useAccountTransactionsStore } from "../../../account-transactions";

interface EDocCreditsGridProps {
  data: EDocCreditItem[];
  loading: boolean;
  onRowDoubleClick?: (item: EDocCreditItem) => void;
  onSelectionChanged?: (item: EDocCreditItem | null) => void;
}

export function EDocCreditsGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
}: EDocCreditsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  // Seçili item
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return data.find((item) => item._id === selectedId) || null;
  }, [selectedId, data]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleRowClick = useCallback(
    (row: EDocCreditItem) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged]
  );

  const handleRowDoubleClick = useCallback(
    (row: EDocCreditItem) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  // Log panelini aç (toolbar butonu)
  const handleOpenLogs = useCallback(() => {
    if (!selectedItem || !selectedItem.customerId) return;
    openEntityPanel({
      customerId: selectedItem.customerId,
      activeTab: "e-transform",
      eTransformId: selectedItem._id,
      title: `E-Dönüşüm: ${selectedItem.customerName || selectedItem.erpId}`,
    });
  }, [selectedItem, openEntityPanel]);

  // Cari hareketleri modalını aç (toolbar butonu)
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedItem || !selectedItem.erpId) return;
    openAccountTransactionsModal(selectedItem.erpId, selectedItem.internalFirm || "VERI");
  }, [selectedItem, openAccountTransactionsModal]);

  // Toolbar custom butonları
  const toolbarCustomButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const buttons: ToolbarButtonConfig[] = [];

    // Loglar
    buttons.push({
      id: "open-logs",
      label: "Log",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      onClick: handleOpenLogs,
      disabled: !selectedItem || !selectedItem.customerId,
      variant: "default",
    });

    // Cari Hareketleri
    buttons.push({
      id: "account-transactions",
      label: "Cari Hareket",
      icon: <Receipt className="w-3.5 h-3.5" />,
      onClick: handleOpenAccountTransactions,
      disabled: !selectedItem || !selectedItem.erpId,
      variant: "primary",
    });

    return buttons;
  }, [selectedItem, handleOpenLogs, handleOpenAccountTransactions]);

  const columns: GridColumnDef<EDocCreditItem>[] = eDocCreditColumnDefs.map(
    (col) => ({
      ...col,
      cellClassName: (_value: unknown, row: EDocCreditItem) => {
        const original =
          typeof col.cellClassName === "function"
            ? col.cellClassName(_value, row)
            : col.cellClassName || "";
        return selectedId === row._id
          ? `${original} bg-blue-50 dark:bg-blue-900/20`.trim()
          : original;
      },
    })
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<EDocCreditItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{
          exportFileName: "kontor_yuklemeleri",
          customButtons: toolbarCustomButtons,
        }}
        stateKey="e-doc-credits"
      />
    </div>
  );
}
