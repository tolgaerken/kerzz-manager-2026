import type { GridColumnDef } from "@kerzz/grid";
import type { NotificationLog } from "../../types";

const formatDate = (value: unknown): string => {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value as string));
};

export const notificationHistoryColumnDefs: GridColumnDef<NotificationLog>[] = [
  {
    id: "sentAt",
    header: "Tarih",
    accessorKey: "sentAt",
    width: 160,
    valueFormatter: formatDate,
  },
  {
    id: "channel",
    header: "Kanal",
    accessorKey: "channel",
    width: 110,
    cell: (value) => {
      const isEmail = value === "email";
      return (
        <span
          className={
            isEmail
              ? "text-[var(--color-info)]"
              : "text-[var(--color-success)]"
          }
        >
          {isEmail ? "E-posta" : "SMS"}
        </span>
      );
    },
  },
  {
    id: "recipient",
    header: "Alıcı",
    minWidth: 200,
    accessorFn: (row) => {
      const parts: string[] = [];
      if (row.recipientName) parts.push(row.recipientName);
      if (row.recipientEmail) parts.push(row.recipientEmail);
      else if (row.recipientPhone) parts.push(row.recipientPhone);
      return parts.join(" — ");
    },
  },
  {
    id: "contextType",
    header: "Tür",
    accessorKey: "contextType",
    width: 100,
    valueFormatter: (value) =>
      value === "invoice" ? "Fatura" : "Kontrat",
  },
  {
    id: "templateCode",
    header: "Şablon",
    accessorKey: "templateCode",
    width: 180,
    cellClassName: "text-[var(--color-muted-foreground)]",
  },
  {
    id: "status",
    header: "Durum",
    accessorKey: "status",
    width: 120,
    cell: (value) => {
      const isSent = value === "sent";
      return (
        <span
          className={
            isSent
              ? "text-[var(--color-success)]"
              : "text-[var(--color-error)]"
          }
        >
          {isSent ? "Gönderildi" : "Başarısız"}
        </span>
      );
    },
  },
];
