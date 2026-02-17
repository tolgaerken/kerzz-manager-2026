import type { GridColumnDef } from "@kerzz/grid";
import type { ContractPayment } from "../../../types";

/** Kist badge bileşeni */
const TypeBadge = ({ isProrated }: { isProrated: boolean }) => {
  if (isProrated) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-info)]/15 text-[var(--color-info)] border border-[var(--color-info)]/30">
        Kıst
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
      Aylık
    </span>
  );
};

export const contractPaymentsColumns: GridColumnDef<ContractPayment>[] = [
  {
    id: "type",
    accessorKey: "type",
    header: "Tip",
    width: 80,
    minWidth: 70,
    filter: { type: "dropdown" },
    editable: false,
    cell: (value) => <TypeBadge isProrated={value === "prorated"} />
  },
  {
    id: "payDate",
    accessorKey: "payDate",
    header: "Dönem",
    width: 110,
    minWidth: 90,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric"
      });
    }
  },
  {
    id: "invoiceNo",
    accessorKey: "invoiceNo",
    header: "Fatura No",
    width: 140,
    minWidth: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "invoiceDate",
    accessorKey: "invoiceDate",
    header: "Fatura Tarihi",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "invoiceTotal",
    accessorKey: "invoiceTotal",
    header: "Fatura Tutarı",
    width: 130,
    minWidth: 120,
    align: "right",
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "number" },
    footer: {
      aggregate: "sum",
      format: (value) => {
        if (value == null) return "";
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value as number);
    }
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Tutar",
    width: 120,
    minWidth: 100,
    align: "right",
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "number" },
    footer: {
      aggregate: "sum",
      format: (value) => {
        if (value == null) return "";
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value as number);
    }
  },
  {
    id: "balance",
    accessorKey: "balance",
    header: "Bakiye",
    width: 120,
    minWidth: 100,
    align: "right",
    filter: { type: "dropdown" },
    editable: false,
    footer: {
      aggregate: "sum",
      format: (value) => {
        if (value == null) return "";
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value as number);
    }
  },
  {
    id: "paid",
    accessorKey: "paid",
    header: "Ödendi",
    width: 90,
    minWidth: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "paymentDate",
    accessorKey: "paymentDate",
    header: "Ödeme Tarihi",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "yearly",
    accessorKey: "yearly",
    header: "Yıllık",
    width: 90,
    minWidth: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
