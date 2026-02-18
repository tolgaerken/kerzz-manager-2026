import { useMemo } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import { useQuery } from "@tanstack/react-query";
import { fetchContracts } from "../../../contracts/api/contractsApi";
import type { Contract } from "../../../contracts/types";
import type { Customer } from "../../types";

interface CustomerContractsModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(value);
}

const contractColumns: GridColumnDef<Contract>[] = [
  {
    id: "no",
    header: "No",
    accessorKey: "no",
    width: 80,
    sortable: true,
    align: "right",
    cell: (value) => <span className="font-mono">{String(value ?? "-")}</span>
  },
  {
    id: "startDate",
    header: "Başlangıç",
    accessorKey: "startDate",
    width: 110,
    sortable: true,
    cell: (value) => formatDate(value as string)
  },
  {
    id: "endDate",
    header: "Bitiş",
    accessorKey: "endDate",
    width: 110,
    sortable: true,
    cell: (value) => formatDate(value as string)
  },
  {
    id: "yearly",
    header: "Periyot",
    accessorKey: "yearly",
    width: 90,
    sortable: true,
    cell: (value) => (value ? "Yıllık" : "Aylık"),
    filter: { type: "dropdown", showCounts: true }
  },
  {
    id: "total",
    header: "Aylık Tutar",
    accessorKey: "total",
    width: 140,
    sortable: true,
    align: "right",
    cell: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    footer: { aggregate: "sum", format: (v) => formatCurrency(v as number) }
  },
  {
    id: "yearlyTotal",
    header: "Yıllık Tutar",
    accessorKey: "yearlyTotal",
    width: 140,
    sortable: true,
    align: "right",
    cell: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    footer: { aggregate: "sum", format: (v) => formatCurrency(v as number) }
  },
  {
    id: "internalFirm",
    header: "İç Firma",
    accessorKey: "internalFirm",
    width: 100,
    sortable: true,
    filter: { type: "dropdown", showCounts: true }
  },
  {
    id: "description",
    header: "Açıklama",
    accessorKey: "description",
    width: 200,
    sortable: true,
    filter: { type: "input" }
  }
];

export function CustomerContractsModal({
  isOpen,
  customer,
  onClose
}: CustomerContractsModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-contracts", customer?.id],
    queryFn: () =>
      fetchContracts({
        customerId: customer!.id,
        flow: "all",
        sortField: "no",
        sortOrder: "desc"
      }),
    enabled: isOpen && !!customer?.id,
    staleTime: 30 * 1000
  });

  const contracts = useMemo(() => data?.data ?? [], [data]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex w-full max-w-5xl flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <FileText className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                Kontratlar
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {customer.name || customer.brand}
              </p>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                {contracts.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Kontratlar yükleniyor...</span>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-[var(--color-muted-foreground)]">
              Bu müşteriye ait kontrat bulunamadı.
            </div>
          ) : (
            <Grid<Contract>
              data={contracts}
              columns={contractColumns}
              height={440}
              locale="tr"
              loading={isLoading}
              getRowId={(row) => row._id}
              toolbar={{
                showSearch: true,
                showExcelExport: true,
                showColumnVisibility: true,
                exportFileName: `kontratlar-${customer.name || customer.id}`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
