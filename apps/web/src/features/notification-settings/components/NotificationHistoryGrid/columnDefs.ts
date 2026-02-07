import type { ColDef } from "ag-grid-community";
import type { NotificationLog } from "../../types";

const dateFormatter = (params: { value: string }) => {
  if (!params.value) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(params.value));
};

export const notificationHistoryColumnDefs: ColDef<NotificationLog>[] = [
  {
    field: "sentAt",
    headerName: "Tarih",
    width: 160,
    valueFormatter: dateFormatter,
    sort: "desc",
  },
  {
    field: "channel",
    headerName: "Kanal",
    width: 110,
    valueFormatter: (params) =>
      params.value === "email" ? "E-posta" : "SMS",
    cellClass: (params) =>
      params.value === "email" ? "text-blue-600" : "text-green-600",
  },
  {
    headerName: "Alıcı",
    flex: 1,
    minWidth: 200,
    valueGetter: (params) => {
      const d = params.data;
      if (!d) return "";
      const parts: string[] = [];
      if (d.recipientName) parts.push(d.recipientName);
      if (d.recipientEmail) parts.push(d.recipientEmail);
      else if (d.recipientPhone) parts.push(d.recipientPhone);
      return parts.join(" — ");
    },
  },
  {
    field: "contextType",
    headerName: "Tür",
    width: 100,
    valueFormatter: (params) =>
      params.value === "invoice" ? "Fatura" : "Kontrat",
  },
  {
    field: "templateCode",
    headerName: "Şablon",
    width: 180,
    cellClass: "text-[var(--color-muted)]",
  },
  {
    field: "status",
    headerName: "Durum",
    width: 120,
    valueFormatter: (params) =>
      params.value === "sent" ? "Gönderildi" : "Başarısız",
    cellClass: (params) =>
      params.value === "sent" ? "text-green-600" : "text-red-600",
  },
];
