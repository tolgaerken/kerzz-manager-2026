import { useMemo, useCallback } from "react";
import { Grid, type GridColumnDef, type ToolbarConfig } from "@kerzz/grid";
import { LinkIcon, CheckCircle, Send } from "lucide-react";
import type { BankTransaction, BankAccount, ErpStatus } from "../../types";

interface BankTransactionsGridProps {
  data: BankTransaction[];
  loading: boolean;
  bankAccounts: BankAccount[];
  onStatusChange: (id: string, status: ErpStatus) => void;
  onUnlink: (id: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | Date | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    waiting: {
      label: "Bekliyor",
      className: "bg-warning/20 text-warning",
    },
    success: {
      label: "İşlendi",
      className: "bg-success/20 text-success",
    },
    error: {
      label: "Hata",
      className: "bg-error/20 text-error",
    },
    manual: {
      label: "Manuel",
      className: "bg-info/20 text-info",
    },
  };

  const badge = map[status] || { label: status, className: "bg-accent/20 text-accent" };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export function BankTransactionsGrid({
  data,
  loading,
  bankAccounts,
  onStatusChange,
  onUnlink,
}: BankTransactionsGridProps) {
  const getBankName = useCallback(
    (bankAccId: string): string => {
      const bank = bankAccounts.find((b) => b.bankAccId === bankAccId);
      return bank?.bankAccName ?? bankAccId;
    },
    [bankAccounts],
  );

  const columns: GridColumnDef<BankTransaction>[] = useMemo(
    () => [
      {
        id: "bankAccName",
        header: "Banka",
        accessorFn: (row: BankTransaction) => getBankName(row.bankAccId),
        width: 150,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown" as const, showCounts: true },
      },
      {
        id: "createDate",
        header: "Tarih",
        accessorKey: "createDate",
        width: 140,
        sortable: true,
        resizable: true,
        cell: (value: unknown) => formatDate(value as string),
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 250,
        sortable: true,
        resizable: true,
        filter: { type: "input" as const },
      },
      {
        id: "amount",
        header: "Tutar",
        accessorKey: "amount",
        width: 120,
        sortable: true,
        resizable: true,
        align: "right" as const,
        cell: (value: unknown) => {
          const amount = value as number;
          return (
            <span
              className={`font-medium ${
                amount >= 0 ? "text-success" : "text-error"
              }`}
            >
              {formatCurrency(amount)}
            </span>
          );
        },
        footer: {
          aggregate: "sum" as const,
          format: (v: number) => formatCurrency(v),
        },
      },
      {
        id: "erpStatus",
        header: "Durum",
        accessorKey: "erpStatus",
        width: 100,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown" as const, showCounts: true },
        cell: (value: unknown) => getStatusBadge(value as string),
      },
      {
        id: "opponentIban",
        header: "IBAN",
        accessorKey: "opponentIban",
        width: 120,
        sortable: true,
        resizable: true,
        filter: { type: "input" as const },
      },
      {
        id: "erpAccountCode",
        header: "Cari Hesap Kodu",
        accessorKey: "erpAccountCode",
        width: 160,
        sortable: true,
        resizable: true,
        filter: { type: "input" as const },
      },
      {
        id: "erpGlAccountCode",
        header: "Muhasebe Kodu",
        accessorKey: "erpGlAccountCode",
        width: 160,
        sortable: true,
        resizable: true,
        filter: { type: "input" as const },
      },
      {
        id: "name",
        header: "Ad",
        accessorKey: "name",
        width: 150,
        sortable: true,
        resizable: true,
        filter: { type: "input" as const },
      },
      {
        id: "actions",
        header: "İşlemler",
        width: 100,
        sortable: false,
        resizable: false,
        cell: (_value: unknown, row: BankTransaction) => {
          const isSuccess = row.erpStatus === "success";
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlink(row.id);
                }}
                title="Cari Hesabı Sil"
                className="rounded p-1 hover:bg-surface-hover transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5 text-muted" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSuccess) onStatusChange(row.id, "manual");
                }}
                disabled={isSuccess}
                title="Manuel İşlendi Yap"
                className="rounded p-1 hover:bg-surface-hover transition-colors disabled:opacity-30"
              >
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSuccess) onStatusChange(row.id, "waiting");
                }}
                disabled={isSuccess}
                title="Tekrar Dene"
                className="rounded p-1 hover:bg-surface-hover transition-colors disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5 text-info" />
              </button>
            </div>
          );
        },
      },
    ],
    [getBankName, onStatusChange, onUnlink],
  );

  const toolbarConfig: ToolbarConfig<BankTransaction> = useMemo(
    () => ({
      exportFileName: "banka-islemleri",
    }),
    [],
  );

  return (
    <div className="flex-1 rounded-lg border border-border bg-surface overflow-hidden">
      <Grid<BankTransaction>
        data={data}
        columns={columns}
        loading={loading}
        height="100%"
        locale="tr"
        stateKey="bank-transactions-grid"
        getRowId={(row) => row.id}
        toolbar={toolbarConfig}
      />
    </div>
  );
}
