import type { GridColumnDef } from "@kerzz/grid";
import type { Feedback } from "../../types/feedback.types";

const STATUS_LABEL_MAP: Record<string, string> = {
  open: "Açık",
  in_progress: "İşleniyor",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

const PRIORITY_LABEL_MAP: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
};

const STATUS_CLASS_MAP: Record<string, string> = {
  open: "bg-[var(--color-info)]/20 text-[var(--color-info)]",
  in_progress: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
  completed: "bg-[var(--color-success)]/20 text-[var(--color-success)]",
  rejected: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
};

const PRIORITY_CLASS_MAP: Record<string, string> = {
  low: "bg-[var(--color-muted-foreground)]/20 text-[var(--color-muted-foreground)]",
  medium: "bg-[var(--color-info)]/20 text-[var(--color-info)]",
  high: "bg-[var(--color-warning)]/20 text-[var(--color-warning)]",
  urgent: "bg-[var(--color-error)]/20 text-[var(--color-error)]",
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const feedbackColumnDefs: GridColumnDef<Feedback>[] = [
  {
    id: "title",
    header: "Başlık",
    accessorKey: "title",
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-medium",
  },
  {
    id: "description",
    header: "Açıklama",
    accessorKey: "description",
    minWidth: 300,
    sortable: true,
    filter: { type: "input" },
    cell: (value: unknown) => {
      const desc = value as string;
      if (!desc) return "-";
      return desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;
    },
  },
  {
    id: "status",
    header: "Durum",
    accessorKey: "status",
    width: 130,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value: unknown) => {
      const status = value as string;
      const label = STATUS_LABEL_MAP[status] || status;
      const classes = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.open;
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}">${label}</span>`;
    },
    enableHtml: true,
  },
  {
    id: "priority",
    header: "Öncelik",
    accessorKey: "priority",
    width: 110,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value: unknown) => {
      const priority = value as string;
      const label = PRIORITY_LABEL_MAP[priority] || priority;
      const classes = PRIORITY_CLASS_MAP[priority] || PRIORITY_CLASS_MAP.medium;
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}">${label}</span>`;
    },
    enableHtml: true,
  },
  {
    id: "createdByName",
    header: "Oluşturan",
    accessorKey: "createdByName",
    width: 150,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "createdAt",
    header: "Oluşturma Tarihi",
    accessorKey: "createdAt",
    width: 160,
    sortable: true,
    cell: (value: unknown) => formatDate(value as string),
  },
  {
    id: "updatedAt",
    header: "Güncelleme Tarihi",
    accessorKey: "updatedAt",
    width: 160,
    sortable: true,
    cell: (value: unknown) => formatDate(value as string),
  },
];
