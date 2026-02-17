import type { GridColumnDef } from "@kerzz/grid";
import { createElement } from "react";
import type { Feedback } from "../../types/feedback.types";
import { stripHtmlToText } from "../../utils/feedbackHtml";

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
      const desc = typeof value === "string" ? value : "";
      const plainText = stripHtmlToText(desc);
      if (!plainText) return "-";
      return plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
    },
  },
  {
    id: "replyCount",
    header: "Yanıt",
    accessorKey: "replyCount",
    width: 80,
    sortable: true,
    cell: (value: unknown) => {
      const count = typeof value === "number" ? value : 0;
      if (count === 0) {
        return "-";
      }
      return createElement(
        "span",
        {
          className:
            "inline-flex items-center rounded-full bg-[var(--color-info)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-info)]",
        },
        `${count}`,
      );
    },
  },
  {
    id: "screenshots",
    header: "Görsel",
    accessorKey: "screenshots",
    width: 90,
    sortable: false,
    cell: (value: unknown) => {
      if (!Array.isArray(value) || value.length === 0) {
        return "-";
      }
      const count = value.length;
      return createElement(
        "span",
        {
          className:
            "inline-flex items-center rounded-full bg-[var(--color-primary)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]",
        },
        `${count} görsel`,
      );
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
      const status = typeof value === "string" ? value : "";
      const label = STATUS_LABEL_MAP[status] || status;
      const classes = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.open;
      return createElement(
        "span",
        {
          className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`,
        },
        label,
      );
    },
  },
  {
    id: "priority",
    header: "Öncelik",
    accessorKey: "priority",
    width: 110,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value: unknown) => {
      const priority = typeof value === "string" ? value : "";
      const label = PRIORITY_LABEL_MAP[priority] || priority;
      const classes = PRIORITY_CLASS_MAP[priority] || PRIORITY_CLASS_MAP.medium;
      return createElement(
        "span",
        {
          className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`,
        },
        label,
      );
    },
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
    cell: (value: unknown) => formatDate(typeof value === "string" ? value : undefined),
  },
  {
    id: "updatedAt",
    header: "Güncelleme Tarihi",
    accessorKey: "updatedAt",
    width: 160,
    sortable: true,
    cell: (value: unknown) => formatDate(typeof value === "string" ? value : undefined),
  },
];
