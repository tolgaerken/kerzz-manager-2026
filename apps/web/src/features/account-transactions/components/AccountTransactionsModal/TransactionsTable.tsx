import { useCallback, useMemo, useState, useEffect } from "react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import { Calendar, FileText, TrendingDown, TrendingUp, Hash, Tag, DollarSign, Loader2 } from "lucide-react";
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

// Mobile card bileşeni
function TransactionCard({
  transaction,
  isSelected,
  onClick,
}: {
  transaction: AccountTransaction;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      {/* Tarih ve Belge No */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(transaction.TARIH)}</span>
        </div>
        {transaction.BELGE_NO && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
            <Hash className="w-3 h-3" />
            <span>{transaction.BELGE_NO}</span>
          </div>
        )}
      </div>

      {/* Açıklama */}
      <div className="flex items-start gap-2 mb-3">
        <FileText className="w-4 h-4 mt-0.5 text-[var(--color-muted-foreground)] flex-shrink-0" />
        <p className="text-sm text-[var(--color-foreground)] line-clamp-2">
          {transaction.ACIKLAMA || "-"}
        </p>
      </div>

      {/* Borç ve Alacak */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-[var(--color-error)]" />
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Borç</p>
            <p className={`text-sm font-medium ${transaction.BORC ? "text-[var(--color-error)]" : "text-[var(--color-muted-foreground)]"}`}>
              {formatCurrency(transaction.BORC)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)]">Alacak</p>
            <p className={`text-sm font-medium ${transaction.ALACAK ? "text-[var(--color-success)]" : "text-[var(--color-muted-foreground)]"}`}>
              {formatCurrency(transaction.ALACAK)}
            </p>
          </div>
        </div>
      </div>

      {/* Alt Bilgiler */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        {transaction.HAREKET_TURU && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
            <Tag className="w-3 h-3" />
            <span>{transaction.HAREKET_TURU}</span>
          </div>
        )}
        {transaction.DOVIZ_TUTAR !== null && transaction.DOVIZ_TUTAR !== undefined && transaction.DOVIZ_TUTAR !== 0 && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
            <DollarSign className="w-3 h-3" />
            <span>{formatCurrency(transaction.DOVIZ_TUTAR)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TransactionsTable({
  transactions,
  loading,
  selectedBelgeNo,
  onRowClick,
  height = 400,
}: TransactionsTableProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
          <span className={value ? "text-[var(--color-error)] font-medium" : ""}>
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
          <span className={value ? "text-[var(--color-success)] font-medium" : ""}>
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

  // Mobile görünüm - Card liste
  if (isMobile) {
    return (
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-muted-foreground)]">
            Kayıt bulunamadı
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {transactions.map((transaction) => {
              const transactionId = getRowId(transaction);
              return (
                <TransactionCard
                  key={transactionId}
                  transaction={transaction}
                  isSelected={selectedBelgeNo === transactionId}
                  onClick={() => onRowClick(transaction)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop görünüm - Grid
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
