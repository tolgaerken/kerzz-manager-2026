import { useMemo } from "react";
import { X, Key, Loader2 } from "lucide-react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
import { useQuery } from "@tanstack/react-query";
import { fetchLicenses } from "../../../licenses/api/licensesApi";
import type { License } from "../../../licenses/types";
import type { Customer } from "../../types";

interface CustomerLicensesModalProps {
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

const licenseTypeLabels: Record<string, string> = {
  "kerzz-pos": "Kerzz POS",
  "orwi-pos": "Orwi POS",
  "kerzz-cloud": "Kerzz Cloud"
};

const licenseColumns: GridColumnDef<License>[] = [
  {
    id: "id",
    header: "Lisans ID",
    accessorKey: "id",
    width: 100,
    sortable: true,
    cell: (value) => <span className="font-mono text-xs">{String(value ?? "-")}</span>
  },
  {
    id: "brandName",
    header: "Marka",
    accessorKey: "brandName",
    width: 200,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "type",
    header: "Tip",
    accessorKey: "type",
    width: 120,
    sortable: true,
    cell: (value) => licenseTypeLabels[value as string] ?? String(value ?? "-"),
    filter: { type: "dropdown", showCounts: true }
  },
  {
    id: "active",
    header: "Aktif",
    accessorKey: "active",
    width: 80,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value ? "text-[var(--color-success)]" : "text-[var(--color-error)]",
    filter: { type: "dropdown", showCounts: true }
  },
  {
    id: "haveContract",
    header: "Kontrat",
    accessorKey: "haveContract",
    width: 90,
    sortable: true,
    cell: (value) => (value ? "Var" : "Yok"),
    cellClassName: (value) =>
      value ? "text-[var(--color-success)]" : "text-[var(--color-muted-foreground)]",
    filter: { type: "dropdown", showCounts: true }
  },
  {
    id: "block",
    header: "Bloke",
    accessorKey: "block",
    width: 80,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value ? "text-[var(--color-error)]" : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "lastOnline",
    header: "Son Online",
    accessorKey: "lastOnline",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string)
  },
  {
    id: "lastVersion",
    header: "Versiyon",
    accessorKey: "lastVersion",
    width: 100,
    sortable: true,
    cell: (value) => <span className="font-mono text-xs">{String(value ?? "-")}</span>
  }
];

export function CustomerLicensesModal({
  isOpen,
  customer,
  onClose
}: CustomerLicensesModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-licenses", customer?.id],
    queryFn: () =>
      fetchLicenses({
        customerId: customer!.id,
        limit: 99999,
        sortField: "id",
        sortOrder: "asc"
      }),
    enabled: isOpen && !!customer?.id,
    staleTime: 30 * 1000
  });

  const licenses = useMemo(() => data?.data ?? [], [data]);

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning)]/10">
              <Key className="h-5 w-5 text-[var(--color-warning)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                Lisanslar
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {customer.name || customer.brand}
              </p>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[var(--color-warning)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-warning)]">
                {licenses.length}
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
              <span className="text-sm">Lisanslar yükleniyor...</span>
            </div>
          ) : licenses.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-[var(--color-muted-foreground)]">
              Bu müşteriye ait lisans bulunamadı.
            </div>
          ) : (
            <Grid<License>
              data={licenses}
              columns={licenseColumns}
              height={440}
              locale="tr"
              loading={isLoading}
              getRowId={(row) => row._id}
              toolbar={{
                showSearch: true,
                showExcelExport: true,
                showColumnVisibility: true,
                exportFileName: `lisanslar-${customer.name || customer.id}`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
