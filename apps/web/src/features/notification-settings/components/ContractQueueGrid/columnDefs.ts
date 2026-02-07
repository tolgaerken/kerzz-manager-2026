import type { ColDef } from "ag-grid-community";
import type { QueueContractItem } from "../../types";

export const contractQueueColumnDefs: ColDef<QueueContractItem>[] = [
  {
    headerName: "Kontrat / Firma",
    flex: 1,
    minWidth: 200,
    valueGetter: (params) => {
      const d = params.data;
      if (!d) return "";
      const main = d.contractId || d.company || "";
      return d.brand ? `${main} — ${d.brand}` : main;
    },
    cellClass: "font-medium",
  },
  {
    headerName: "Müşteri",
    flex: 1,
    minWidth: 180,
    valueGetter: (params) => {
      const c = params.data?.customer;
      return c?.companyName || c?.name || "";
    },
  },
  {
    field: "endDate",
    headerName: "Bitiş Tarihi",
    width: 120,
  },
  {
    field: "remainingDays",
    headerName: "Kalan Gün",
    width: 100,
  },
  {
    headerName: "İletişim",
    width: 200,
    cellClass: "text-[var(--color-muted)]",
    valueGetter: (params) => {
      const c = params.data?.customer;
      return c?.email || c?.phone || "—";
    },
  },
];
