import { useMemo, type ReactNode } from "react";
import {
  Grid,
  type GridColumnDef,
  type ToolbarConfig,
} from "@kerzz/grid";
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

function getDetailValue(log: SystemLog, key: string): string {
  const details = log.details as Record<string, unknown> | null | undefined;
  if (!details) return "-";
  const value = details[key];
  if (value == null || value === "") return "-";
  return String(value);
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

function CategoryBadge({ value }: { value: string }): JSX.Element {
  const colorMap: Record<string, string> = {
    AUTH: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    CRUD: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    CRON: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    SYSTEM: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || "bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"}`}
    >
      {CATEGORY_LABELS[value] || value}
    </span>
  );
}

function ActionBadge({ value }: { value: string }): JSX.Element {
  const colorMap: Record<string, string> = {
    LOGIN: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    LOGOUT: "bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]",
    LOGIN_FAILED: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    CREATE: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    UPDATE: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    DELETE: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    CRON_START: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    CRON_END: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    CRON_FAILED: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    ERROR: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
    WARNING: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    INFO: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[value] || "bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"}`}
    >
      {ACTION_LABELS[value] || value}
    </span>
  );
}

function StatusBadge({ value }: { value: string }): JSX.Element {
  const colorMap: Record<string, string> = {
    SUCCESS: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    FAILURE: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    ERROR: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || "bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"}`}
    >
      {STATUS_LABELS[value] || value}
    </span>
  );
}

export function SystemLogsGrid({ data, loading, onRowClick }: SystemLogsGridProps) {
  const columns = useMemo<GridColumnDef<SystemLog>[]>(
    () => [
      {
        id: "createdAt",
        header: "Tarih",
        accessorKey: "createdAt",
        width: 170,
        sortable: true,
        cell: (value): string => formatDate(value as string),
        filter: {
          type: "input",
          conditions: ["equals", "contains"],
        },
      },
      {
        id: "category",
        header: "Kategori",
        accessorKey: "category",
        width: 140,
        sortable: true,
        cell: (value): ReactNode => {
          if (!value) return null;
          return <CategoryBadge value={value as string} />;
        },
        filter: {
          type: "dropdown",
          showCounts: true,
        },
      },
      {
        id: "action",
        header: "Aksiyon",
        accessorKey: "action",
        width: 130,
        sortable: true,
        cell: (value): ReactNode => {
          if (!value) return null;
          return <ActionBadge value={value as string} />;
        },
        filter: {
          type: "dropdown",
          showCounts: true,
        },
      },
      {
        id: "status",
        header: "Durum",
        accessorKey: "status",
        width: 110,
        sortable: true,
        cell: (value): ReactNode => {
          if (!value) return null;
          return <StatusBadge value={value as string} />;
        },
        filter: {
          type: "dropdown",
          showCounts: true,
        },
      },
      {
        id: "module",
        header: "Modül",
        accessorKey: "module",
        width: 150,
        sortable: true,
        cell: (value): string => MODULE_LABELS[value as string] || (value as string) || "-",
        filter: {
          type: "input",
          conditions: ["equals", "contains"],
        },
      },
      {
        id: "userName",
        header: "Kullanıcı",
        accessorKey: "userName",
        width: 150,
        sortable: true,
        cell: (value): string => (value as string) || "-",
        filter: {
          type: "input",
          conditions: ["equals", "contains", "startsWith"],
        },
      },
      {
        id: "entityType",
        header: "Entity",
        accessorKey: "entityType",
        width: 120,
        sortable: true,
        cell: (value): string => (value as string) || "-",
        filter: {
          type: "input",
          conditions: ["equals", "contains"],
        },
      },
      {
        id: "templateCode",
        header: "Bildirim",
        width: 170,
        sortable: false,
        cell: (_value, row): string => getDetailValue(row, "templateCode"),
        filter: {
          type: "input",
          conditions: ["equals", "contains", "startsWith"],
        },
      },
      {
        id: "recipientEmail",
        header: "E-Posta",
        width: 220,
        sortable: false,
        cell: (_value, row): string => getDetailValue(row, "recipientEmail"),
        filter: {
          type: "input",
          conditions: ["equals", "contains", "startsWith"],
        },
      },
      {
        id: "recipientPhone",
        header: "Telefon",
        width: 150,
        sortable: false,
        cell: (_value, row): string => getDetailValue(row, "recipientPhone"),
        filter: {
          type: "input",
          conditions: ["equals", "contains", "startsWith"],
        },
      },
      {
        id: "channel",
        header: "Kanal",
        width: 100,
        sortable: false,
        cell: (_value, row): string => getDetailValue(row, "channel"),
        filter: {
          type: "dropdown",
          showCounts: true,
        },
      },
      {
        id: "method",
        header: "Method",
        accessorKey: "method",
        width: 80,
        sortable: true,
        cell: (value): string => (value as string) || "-",
        filter: {
          type: "dropdown",
          showCounts: true,
        },
      },
      {
        id: "path",
        header: "Path",
        accessorKey: "path",
        width: 200,
        sortable: true,
        cell: (value): string => (value as string) || "-",
        filter: {
          type: "input",
          conditions: ["equals", "contains", "startsWith"],
        },
      },
      {
        id: "statusCode",
        header: "Durum Kodu",
        accessorKey: "statusCode",
        width: 100,
        sortable: true,
        align: "right",
        cell: (value): string => (value != null ? String(value) : "-"),
        filter: {
          type: "numeric",
          conditions: ["equals", "greaterThan", "lessThan"],
        },
      },
      {
        id: "duration",
        header: "Süre (ms)",
        accessorKey: "duration",
        width: 100,
        sortable: true,
        align: "right",
        cell: (value): string => (value != null ? `${value}ms` : "-"),
        filter: {
          type: "numeric",
          conditions: ["equals", "greaterThan", "lessThan"],
        },
      },
      {
        id: "errorMessage",
        header: "Hata",
        accessorKey: "errorMessage",
        width: 200,
        sortable: true,
        cell: (value): ReactNode => {
          if (!value) return "-";
          return (
            <span className="text-[var(--color-error)]">
              {String(value)}
            </span>
          );
        },
        filter: {
          type: "input",
          conditions: ["equals", "contains"],
        },
      },
    ],
    []
  );

  const toolbarConfig: ToolbarConfig<SystemLog> = useMemo(
    () => ({
      exportFileName: "sistem-loglari",
    }),
    []
  );

  return (
    <Grid<SystemLog>
      data={data}
      columns={columns}
      loading={loading}
      height="100%"
      locale="tr"
      stateKey="system-logs-grid"
      getRowId={(row) => row._id}
      onRowClick={onRowClick}
      toolbar={toolbarConfig}
    />
  );
}
