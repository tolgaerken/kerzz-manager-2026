import type { GridColumnDef } from "@kerzz/grid";
import type { Invoice } from "../../types";

// Para formatı
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(value);
};

// Tarih formatı
const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

// Fatura tipi etiket haritası
const invoiceTypeMap: Record<string, { label: string; color: string; bg: string }> = {
  contract: {
    label: "Kontrat",
    color: "var(--color-info-foreground)",
    bg: "color-mix(in oklch, var(--color-info) 15%, transparent)"
  },
  sale: {
    label: "Satış",
    color: "var(--color-primary)",
    bg: "color-mix(in oklch, var(--color-primary) 15%, transparent)"
  },
  eDocuments: {
    label: "E-Belge",
    color: "var(--color-warning-foreground)",
    bg: "color-mix(in oklch, var(--color-warning) 15%, transparent)"
  }
};

// Badge bileşeni (tema uyumlu inline style)
function Badge({ color, bg, children }: { color: string; bg: string; children: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

/**
 * Fatura grid sütun tanımlarını oluşturur.
 * @param autoPaymentCustomerIds Otomatik ödeme talimatı kayıtlı müşteri ID'leri
 */
export function createInvoiceColumnDefs(
  autoPaymentCustomerIds: Set<string>,
  pendingPaymentInvoiceNos: Set<string> = new Set()
): GridColumnDef<Invoice>[] {
  return [
    {
      id: "isPaid",
      header: "Ödeme",
      accessorKey: "isPaid",
      width: 80,
      sortable: true,
      align: "center",
      filter: { type: "dropdown", showCounts: true },
      cell: (value, row: Invoice) => {
        if (pendingPaymentInvoiceNos.has(row.invoiceNumber)) {
          return (
            <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          );
        }
        return value ? "✓" : "✗";
      },
      cellClassName: (value, row: Invoice) =>
        pendingPaymentInvoiceNos.has(row.invoiceNumber)
          ? "text-center"
          : value
            ? "text-[var(--color-success)] font-bold text-center"
            : "text-[var(--color-error)] text-center"
    },
    {
      id: "autoPayment",
      header: "Oto. Ödeme",
      width: 90,
      sortable: true,
      align: "center",
      filter: { type: "dropdown", showCounts: true },
      accessorFn: (row) =>
        autoPaymentCustomerIds.has(row.customerId) ? "Kayıtlı" : "",
      cell: (value) => (value === "Kayıtlı" ? "✓" : "✗"),
      cellClassName: (value) =>
        value === "Kayıtlı"
          ? "text-[var(--color-success)] font-bold text-center"
          : "text-[var(--color-muted)] text-center"
    },
    {
      id: "invoiceNumber",
      header: "Fatura No",
      accessorKey: "invoiceNumber",
      width: 140,
      sortable: true,
      filter: { type: "input" }
    },
    {
      id: "name",
      header: "Müşteri",
      accessorKey: "name",
      minWidth: 200,
      sortable: true,
      filter: { type: "input" },
      footer: { aggregate: "count", label: "" }
    },
    {
      id: "description",
      header: "Açıklama",
      accessorKey: "description",
      minWidth: 150,
      sortable: true,
      filter: { type: "input" }
    },
    {
      id: "invoiceDate",
      header: "Fatura Tarihi",
      accessorKey: "invoiceDate",
      width: 120,
      sortable: true,
      filter: { type: "dateTree" },
      cell: (value) => formatDate(value as string)
    },
    {
      id: "dueDate",
      header: "Son Ödeme",
      accessorKey: "dueDate",
      width: 120,
      sortable: true,
      filter: { type: "dateTree" },
      cell: (value) => formatDate(value as string),
      cellClassName: (_value: unknown, row: Invoice) => {
        if (!row.dueDate || row.isPaid) return "";
        const dueDate = new Date(row.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today ? "text-red-500 font-semibold" : "";
      }
    },
    {
      id: "invoiceType",
      header: "Tip",
      accessorKey: "invoiceType",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      cell: (value) => {
        const type = invoiceTypeMap[value as string] || {
          label: value as string,
          color: "var(--color-muted-foreground)",
          bg: "var(--color-surface-elevated)"
        };
        return <Badge color={type.color} bg={type.bg}>{type.label}</Badge>;
      }
    },
    {
      id: "total",
      header: "Tutar",
      accessorKey: "total",
      width: 120,
      sortable: true,
      align: "right",
      cell: (value) => formatCurrency(value as number),
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v)
      }
    },
    {
      id: "taxTotal",
      header: "KDV",
      accessorKey: "taxTotal",
      width: 100,
      sortable: true,
      align: "right",
      cell: (value) => formatCurrency(value as number),
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v)
      }
    },
    {
      id: "grandTotal",
      header: "Genel Toplam",
      accessorKey: "grandTotal",
      width: 130,
      sortable: true,
      align: "right",
      cell: (value) => formatCurrency(value as number),
      cellClassName: "font-semibold text-blue-600",
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v)
      }
    },
    {
      id: "internalFirm",
      header: "Firma",
      accessorKey: "internalFirm",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true }
    },
    {
      id: "paymentSuccessDate",
      header: "Ödeme Tarihi",
      accessorKey: "paymentSuccessDate",
      width: 120,
      sortable: true,
      filter: { type: "dateTree" },
      cell: (value) => formatDate(value as string)
    }
  ];
}
