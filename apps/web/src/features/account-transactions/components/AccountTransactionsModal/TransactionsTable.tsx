import { useCallback, useMemo } from "react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import type { AccountTransaction } from "../../types";

interface TransactionsTableProps {
  transactions: AccountTransaction[];
  loading?: boolean;
  selectedBelgeNo: string | null;
  onRowClick: (transaction: AccountTransaction) => void;
  height?: number | string;
}

function formatDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(value as string);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || value === 0) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value as number);
}

export function TransactionsTable({
  transactions,
  loading,
  selectedBelgeNo,
  onRowClick,
  height = 400,
}: TransactionsTableProps) {
  const columns: GridColumnDef<AccountTransaction>[] = useMemo(
    () => [
      {
        id: "TARIH",
        header: "Tarih",
        accessorKey: "TARIH",
        width: 110,
        sortable: true,
        cell: (value) => formatDate(value),
        filter: { type: "dateTree" },
      },
      {
        id: "ACIKLAMA",
        header: "Açıklama",
        accessorKey: "ACIKLAMA",
        width: 300,
        sortable: true,
        filter: { type: "input", conditions: ["contains"] },
      },
      {
        id: "BORC",
        header: "Borç",
        accessorKey: "BORC",
        width: 130,
        sortable: true,
        align: "right",
        cell: (value) => (
          <span className={value ? "text-red-500 font-medium" : ""}>
            {formatCurrency(value)}
          </span>
        ),
        footer: {
          aggregate: "sum",
          format: (v) => formatCurrency(v),
        },
      },
      {
        id: "ALACAK",
        header: "Alacak",
        accessorKey: "ALACAK",
        width: 130,
        sortable: true,
        align: "right",
        cell: (value) => (
          <span className={value ? "text-green-500 font-medium" : ""}>
            {formatCurrency(value)}
          </span>
        ),
        footer: {
          aggregate: "sum",
          format: (v) => formatCurrency(v),
        },
      },
      {
        id: "BELGE_NO",
        header: "Belge No",
        accessorKey: "BELGE_NO",
        width: 120,
        sortable: true,
        filter: { type: "input", conditions: ["contains", "equals"] },
      },
      {
        id: "HAREKET_TURU",
        header: "Hareket Türü",
        accessorKey: "HAREKET_TURU",
        width: 100,
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
      },
      {
        id: "DOVIZ_TUTAR",
        header: "Döviz Tutar",
        accessorKey: "DOVIZ_TUTAR",
        width: 120,
        sortable: true,
        align: "right",
        cell: (value) => formatCurrency(value),
      },
    ],
    []
  );

  const handleRowClick = useCallback(
    (row: AccountTransaction, _index: number) => {
      onRowClick(row);
    },
    [onRowClick]
  );

  const getRowId = useCallback(
    (row: AccountTransaction) => `${row.BELGE_NO}-${row.TARIH}-${row.BORC}-${row.ALACAK}`,
    []
  );

  return (
    <div className="w-full border border-[var(--color-border)] rounded-lg overflow-hidden">
      <Grid<AccountTransaction>
        data={transactions}
        columns={columns}
        loading={loading}
        height={height}
        locale="tr"
        getRowId={getRowId}
        onRowClick={handleRowClick}
        selectionMode="single"
        selectedIds={selectedBelgeNo ? [selectedBelgeNo] : []}
        toolbar={{
          showSearch: true,
          showExcelExport: true,
          showPdfExport: true,
          showColumnVisibility: true,
          exportFileName: "cari-hareketleri",
        }}
      />
    </div>
  );
}
