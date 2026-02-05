import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent } from "ag-grid-community";
import type { SystemLog } from "../../types";
import {
  CATEGORY_LABELS,
  ACTION_LABELS,
  STATUS_LABELS,
  MODULE_LABELS,
} from "../../constants/system-logs.constants";

interface SystemLogsGridProps {
  data: SystemLog[];
  loading: boolean;
  onRowClick: (log: SystemLog) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function CategoryBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    AUTH: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    CRUD: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    CRON: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    SYSTEM: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || "bg-gray-100 text-gray-800"}`}
    >
      {CATEGORY_LABELS[value] || value}
    </span>
  );
}

function ActionBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    LOGIN: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    LOGOUT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    LOGIN_FAILED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    CREATE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    UPDATE: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    DELETE: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    CRON_START: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    CRON_END: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    CRON_FAILED: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    ERROR: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    WARNING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    INFO: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[value] || "bg-gray-100 text-gray-700"}`}
    >
      {ACTION_LABELS[value] || value}
    </span>
  );
}

function StatusBadge({ value }: { value: string }) {
  const colorMap: Record<string, string> = {
    SUCCESS: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    FAILURE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    ERROR: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || "bg-gray-100 text-gray-800"}`}
    >
      {STATUS_LABELS[value] || value}
    </span>
  );
}

export function SystemLogsGrid({ data, loading, onRowClick }: SystemLogsGridProps) {
  const columnDefs = useMemo<ColDef<SystemLog>[]>(
    () => [
      {
        headerName: "Tarih",
        field: "createdAt",
        width: 170,
        valueFormatter: (params) => formatDate(params.value),
        sortable: true,
      },
      {
        headerName: "Kategori",
        field: "category",
        width: 140,
        cellRenderer: (params: { value: string }) => {
          if (!params.value) return null;
          return CategoryBadge({ value: params.value });
        },
      },
      {
        headerName: "Aksiyon",
        field: "action",
        width: 130,
        cellRenderer: (params: { value: string }) => {
          if (!params.value) return null;
          return ActionBadge({ value: params.value });
        },
      },
      {
        headerName: "Durum",
        field: "status",
        width: 110,
        cellRenderer: (params: { value: string }) => {
          if (!params.value) return null;
          return StatusBadge({ value: params.value });
        },
      },
      {
        headerName: "Modül",
        field: "module",
        width: 150,
        valueFormatter: (params) =>
          MODULE_LABELS[params.value] || params.value,
      },
      {
        headerName: "Kullanıcı",
        field: "userName",
        width: 150,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Entity",
        field: "entityType",
        width: 120,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Method",
        field: "method",
        width: 80,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Path",
        field: "path",
        width: 200,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Durum Kodu",
        field: "statusCode",
        width: 100,
        valueFormatter: (params) =>
          params.value != null ? params.value.toString() : "-",
      },
      {
        headerName: "Süre (ms)",
        field: "duration",
        width: 100,
        valueFormatter: (params) =>
          params.value != null ? `${params.value}ms` : "-",
      },
      {
        headerName: "Hata",
        field: "errorMessage",
        width: 200,
        valueFormatter: (params) => params.value || "-",
        cellClass: "text-red-500",
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      suppressMovable: true,
    }),
    []
  );

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="ag-theme-custom w-full h-full">
      <AgGridReact<SystemLog>
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onRowClicked={(event) => {
          if (event.data) onRowClick(event.data);
        }}
        rowSelection="single"
        animateRows
        loading={loading}
        overlayNoRowsTemplate="<span class='text-[var(--color-text-muted)]'>Henüz sistem logu bulunmuyor</span>"
        overlayLoadingTemplate="<span class='text-[var(--color-text-muted)]'>Yükleniyor...</span>"
        getRowClass={() => "cursor-pointer hover:bg-[var(--color-surface-elevated)]"}
      />
    </div>
  );
}
