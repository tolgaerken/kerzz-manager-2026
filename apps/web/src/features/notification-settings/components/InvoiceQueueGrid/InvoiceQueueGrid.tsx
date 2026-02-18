import { useMemo, useCallback, useState } from "react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import { Eye, MessageSquare, Contact } from "lucide-react";
import { invoiceQueueColumnDefs } from "./columnDefs";
import { ContactInfoModal } from "../ContactInfoModal";
import type { QueueInvoiceItem, QueueCustomer } from "../../types";

interface InvoiceQueueGridProps {
  data: QueueInvoiceItem[];
  loading: boolean;
  onSelectionChanged: (items: QueueInvoiceItem[]) => void;
  onPreviewEmail: (id: string) => void;
  onPreviewSms: (id: string) => void;
}

export function InvoiceQueueGrid({
  data,
  loading,
  onSelectionChanged,
  onPreviewEmail,
  onPreviewSms,
}: InvoiceQueueGridProps) {
  const [contactCustomer, setContactCustomer] = useState<QueueCustomer | null>(null);

  const columns = useMemo<GridColumnDef<QueueInvoiceItem>[]>(
    () => [
      ...invoiceQueueColumnDefs,
      {
        id: "actions",
        header: "İşlemler",
        width: 100,
        sortable: false,
        cell: (_value, row) => (
          <div className="flex items-center gap-1 h-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContactCustomer(row.customer);
              }}
              title="İletişim Bilgileri"
              className="p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] rounded transition-colors"
            >
              <Contact className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewEmail(row.id);
              }}
              title="E-posta Önizleme"
              className="p-1.5 text-[var(--color-info)] hover:bg-[var(--color-info)]/10 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewSms(row.id);
              }}
              title="SMS Önizleme"
              className="p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success)]/10 rounded transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [onPreviewEmail, onPreviewSms, setContactCustomer],
  );

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      const items = selectedIds
        .map((id) => data.find((item) => item.id === id))
        .filter((item): item is QueueInvoiceItem => item !== undefined);
      onSelectionChanged(items);
    },
    [data, onSelectionChanged],
  );

  return (
    <div className="h-full w-full flex-1">
      <ContactInfoModal
        isOpen={contactCustomer !== null}
        customer={contactCustomer}
        onClose={() => setContactCustomer(null)}
      />
      <Grid<QueueInvoiceItem>
        data={data}
        columns={columns}
        loading={loading}
        height="100%"
        locale="tr"
        getRowId={(row) => row.id}
        selectionMode="multiple"
        selectionCheckbox
        onSelectionChange={handleSelectionChange}
        stateKey="invoice-queue-grid"
      />
    </div>
  );
}
