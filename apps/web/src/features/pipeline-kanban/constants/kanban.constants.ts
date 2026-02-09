export type KanbanEntityType = "lead" | "offer" | "sale";

export type KanbanColumnId =
  | "lead-new"
  | "lead-contacted"
  | "lead-qualified"
  | "offer-draft"
  | "offer-sent"
  | "sale-won";

export interface KanbanColumnConfig {
  id: KanbanColumnId;
  label: string;
  entityType: KanbanEntityType;
  status: string;
  weight: number;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: "lead-new", label: "Yeni Lead", entityType: "lead", status: "new", weight: 0.1 },
  {
    id: "lead-contacted",
    label: "İletişimde",
    entityType: "lead",
    status: "contacted",
    weight: 0.2,
  },
  {
    id: "lead-qualified",
    label: "Nitelikli",
    entityType: "lead",
    status: "qualified",
    weight: 0.4,
  },
  {
    id: "offer-draft",
    label: "Teklif Taslak",
    entityType: "offer",
    status: "draft",
    weight: 0.3,
  },
  {
    id: "offer-sent",
    label: "Teklif Gönderildi",
    entityType: "offer",
    status: "sent",
    weight: 0.5,
  },
  {
    id: "sale-won",
    label: "Kazanılan Satış",
    entityType: "sale",
    status: "completed",
    weight: 1,
  },
];
