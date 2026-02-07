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
const invoiceTypeMap: Record<string, { label: string; className: string }> = {
  contract: {
    label: "Kontrat",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  },
  sale: {
    label: "Satış",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  },
  eDocuments: {
    label: "E-Belge",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  }
};

// Badge bileşeni
function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
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
  autoPaymentCustomerIds: Set<string>
): GridColumnDef<Invoice>[] {
  return [
    {
      id: "isPaid",
      header: "Durum",
      accessorKey: "isPaid",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      cell: (value) => {
        if (value) {
          return (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Ödendi
            </Badge>
          );
        }
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Ödenmedi
          </Badge>
        );
      }
    },
    {
      id: "autoPayment",
      header: "Oto. Ödeme",
      width: 110,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      accessorFn: (row) =>
        autoPaymentCustomerIds.has(row.customerId) ? "Kayıtlı" : "",
      cell: (value) => {
        if (value === "Kayıtlı") {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              Kayıtlı
            </Badge>
          );
        }
        return null;
      }
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
          className: "bg-gray-100 text-gray-800"
        };
        return <Badge className={type.className}>{type.label}</Badge>;
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
