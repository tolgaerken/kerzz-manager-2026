import { useCallback, useMemo } from "react";
import { Grid, type GridColumnDef, type ToolbarConfig, type ToolbarButtonConfig, type SortingState } from "@kerzz/grid";
import type { Contract } from "../../types";

interface ContractsGridProps {
  data: Contract[];
  loading: boolean;
  yearlyFilter?: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (contract: Contract) => void;
  onRowSelect?: (contract: Contract | null) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  toolbarButtons?: ToolbarButtonConfig[];
}

// Date formatter
function formatDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(value as string);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// Currency formatter
function formatCurrency(value: unknown): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(value as number);
}

// Contract flow formatter
function formatFlow(value: unknown): string {
  const flowMap: Record<string, string> = {
    active: "Aktif",
    archive: "Arşiv",
    future: "Gelecek"
  };
  return flowMap[value as string] || (value as string) || "-";
}

export function ContractsGrid({
  data,
  loading,
  yearlyFilter,
  onSortChange,
  onRowDoubleClick,
  onRowSelect,
  onSelectionChange,
  selectedIds,
  toolbarButtons
}: ContractsGridProps) {
  // Column definitions for kerzz-grid
  const columns: GridColumnDef<Contract>[] = useMemo(
    () => {
      const baseColumns: GridColumnDef<Contract>[] = [
        {
          id: "no",
          header: "No",
          accessorKey: "no",
          width: 90,
          sortable: true,
          resizable: true,
          align: "center"
        },
        {
          id: "brand",
          header: "Marka",
          accessorKey: "brand",
          width: 200,
          sortable: true,
          resizable: true,
          filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
        },
        {
          id: "company",
          header: "Firma",
          accessorKey: "company",
          width: 250,
          sortable: true,
          resizable: true,
          filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
        },
        {
          id: "description",
          header: "Açıklama",
          accessorKey: "description",
          width: 150,
          sortable: true,
          resizable: true,
          filter: { type: "input", conditions: ["contains"] }
        },
        {
          id: "contractFlow",
          header: "Durum",
          accessorKey: "contractFlow",
          width: 110,
          sortable: true,
          resizable: true,
          filter: { type: "dropdown", showCounts: true },
          cell: (value) => {
            const flowColors: Record<string, string> = {
              active: "#10b981",
              archive: "#6b7280",
              future: "#3b82f6"
            };
            const color = flowColors[value as string] ?? "#666";
            return <span style={{ color, fontWeight: 500 }}>{formatFlow(value)}</span>;
          }
        },
        {
          id: "yearly",
          header: "Periyot",
          accessorKey: "yearly",
          width: 100,
          sortable: true,
          resizable: true,
          cell: (value) => (value ? "Yıllık" : "Aylık")
        },
        {
          id: "startDate",
          header: "Başlangıç",
          accessorKey: "startDate",
          width: 120,
          sortable: true,
          resizable: true,
          cell: (value) => formatDate(value),
          filter: { type: "dateTree" }
        },
        {
          id: "endDate",
          header: "Bitiş",
          accessorKey: "endDate",
          width: 120,
          sortable: true,
          resizable: true,
          cell: (value) => formatDate(value),
          filter: { type: "dateTree" }
        }
      ];

      // Yıllık Tutar kolonu - sadece yıllık filtre seçiliyken veya filtre yokken göster
      if (yearlyFilter === true || yearlyFilter === undefined) {
        baseColumns.push({
          id: "yearlyTotal",
          header: "Yıllık Tutar",
          accessorKey: "yearlyTotal",
          width: 140,
          sortable: true,
          resizable: true,
          align: "right",
          cell: (value) => formatCurrency(value),
          filter: { type: "input", conditions: ["greaterThan", "lessThan", "between", "equals"] },
          footer: {
            aggregate: "sum",
            format: (v) => formatCurrency(v)
          }
        });
      }

      // SaaS Tutar kolonu - her zaman göster
      baseColumns.push({
        id: "saasTotal",
        header: "SaaS Tutar",
        accessorKey: "saasTotal",
        width: 140,
        sortable: true,
        resizable: true,
        align: "right",
        cell: (value) => formatCurrency(value),
        filter: { type: "input", conditions: ["greaterThan", "lessThan", "between", "equals"] },
        footer: {
          aggregate: "sum",
          format: (v) => formatCurrency(v)
        }
      });

      // Aylık Tutar kolonu (total) - sadece aylık filtre seçiliyken veya filtre yokken göster
      if (yearlyFilter === false || yearlyFilter === undefined) {
        baseColumns.push({
          id: "total",
          header: "Aylık Tutar",
          accessorKey: "total",
          width: 150,
          sortable: true,
          resizable: true,
          align: "right",
          cell: (value) => formatCurrency(value),
          filter: { type: "input", conditions: ["greaterThan", "lessThan", "between", "equals"] },
          footer: {
            aggregate: "sum",
            format: (v) => formatCurrency(v)
          }
        });
      }

      // Diğer kolonlar
      baseColumns.push(
        {
          id: "enabled",
          header: "Aktif",
          accessorKey: "enabled",
          width: 80,
          sortable: true,
          resizable: true,
          cell: (value) => (value ? "Evet" : "Hayır")
        },
        {
          id: "blockedLicance",
          header: "Lisans Engeli",
          accessorKey: "blockedLicance",
          width: 120,
          sortable: true,
          resizable: true,
          cell: (value) => (value ? "Evet" : "Hayır")
        },
        {
          id: "internalFirm",
          header: "İç Firma",
          accessorKey: "internalFirm",
          width: 100,
          sortable: true,
          resizable: true,
          filter: { type: "dropdown", showCounts: true }
        }
      );

      return baseColumns;
    },
    [yearlyFilter]
  );

  // Handle sort change from kerzz-grid
  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        onSortChange(id, desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    (row: Contract) => {
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }
    },
    [onRowDoubleClick]
  );

  // Handle row click for selection
  const handleRowClick = useCallback(
    (row: Contract) => {
      if (onRowSelect) {
        onRowSelect(row);
      }
    },
    [onRowSelect]
  );

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig<Contract> = useMemo(
    () => ({
      customButtons: toolbarButtons,
      exportFileName: "kontratlar"
    }),
    [toolbarButtons]
  );

  return (
    <div className="flex-1 min-h-0">
      <Grid<Contract>
        data={data}
        columns={columns}
        loading={loading}
        height="100%"
        locale="tr"
        stateKey="contracts-grid"
        getRowId={(row) => row._id}
        onSortChange={handleSortChange}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        toolbar={toolbarConfig}
      />
    </div>
  );
}
