import { useState, useCallback, useMemo } from "react";
import { Trash2, CreditCard, Plus, Check, Clock, Pencil } from "lucide-react";
import { Grid, type ToolbarConfig, type ToolbarButtonConfig } from "@kerzz/grid";
import type { PipelinePayment } from "../../types/pipeline.types";
import { generateTempId } from "../../utils/lineItemCalculations";
import { paymentItemsColumns } from "../../columnDefs/paymentItemsColumns";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { PaymentItemFormModal } from "../ItemFormModals";

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
  const isMobile = useIsMobile();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
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

  // Form submit handler
  const handleFormSubmit = useCallback(
    (item: PaymentItem) => {
      if (editingItem) {
        onItemsChange(items.map((i) => (i._id === item._id ? item : i)));
      } else {
        onItemsChange([...items, item]);
      }
      setEditingItem(null);
    },
    [items, onItemsChange, editingItem]
  );

  // Mobil kart görünümü
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        {/* Mobil toolbar */}
        {!readOnly && (
          <div className="flex gap-2 pb-3 shrink-0">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ödeme Ekle
            </button>
          </div>
        )}

        {/* Mobil kart listesi */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-8 w-8 text-[var(--color-muted-foreground)] mb-2" />
              <p className="text-sm text-[var(--color-muted-foreground)]">Ödeme bulunamadı</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {items.map((item, index) => (
                <PaymentMobileCard
                  key={item._id || `payment-${index}`}
                  item={item}
                  onEdit={readOnly ? undefined : () => {
                    setEditingItem(item);
                    setIsFormOpen(true);
                  }}
                  onDelete={readOnly ? undefined : () => {
                    onItemsChange(items.filter((i) => i._id !== item._id));
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <PaymentItemFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          editItem={editingItem}
        />
      </div>
    );
  }

  // Desktop grid görünümü
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

// Ödeme yöntemi etiketleri
const METHOD_LABELS: Record<string, string> = {
  "bank-transfer": "Havale/EFT",
  "credit-card": "Kredi Kartı",
  cash: "Nakit",
  check: "Çek",
  other: "Diğer",
};

// Mobil ödeme kartı bileşeni
interface PaymentMobileCardProps {
  item: Partial<PipelinePayment>;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PaymentMobileCard({ item, onEdit, onDelete }: PaymentMobileCardProps) {
  const formatCurrency = (value: number | undefined, currency?: string) => {
    if (value === undefined || value === null) return "-";
    const curr = currency?.toUpperCase() || "TRY";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: curr === "TL" ? "TRY" : curr,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  return (
    <div 
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`rounded-full p-1.5 shrink-0 ${
            item.isPaid 
              ? "bg-[var(--color-success)]/10" 
              : "bg-[var(--color-warning)]/10"
          }`}>
            {item.isPaid ? (
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-[var(--color-warning)]" />
            )}
          </div>
          <span className={`font-semibold text-sm ${
            item.isPaid 
              ? "text-[var(--color-success)]" 
              : "text-[var(--color-foreground)]"
          }`}>
            {formatCurrency(item.amount, item.currency)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-md text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mb-2">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
          item.isPaid 
            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" 
            : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
        }`}>
          {item.isPaid ? "Ödendi" : "Bekliyor"}
        </span>
        {item.method && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
            {METHOD_LABELS[item.method] || item.method}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-[var(--color-muted-foreground)]">Tarih</span>
          <span className="text-[var(--color-foreground)] font-medium">
            {formatDate(item.paymentDate)}
          </span>
        </div>
        {item.invoiceNo && (
          <div className="flex flex-col">
            <span className="text-[var(--color-muted-foreground)]">Fatura No</span>
            <span className="text-[var(--color-foreground)] font-medium">
              {item.invoiceNo}
            </span>
          </div>
        )}
      </div>
      
      {item.description && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
}
