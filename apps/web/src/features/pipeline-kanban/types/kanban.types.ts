import type { Lead } from "../../leads";
import type { Offer } from "../../offers";
import type { Sale } from "../../sales";
import type { KanbanColumnId, KanbanEntityType } from "../constants/kanban.constants";

export interface KanbanItem {
  id: string;
  columnId: KanbanColumnId;
  entityType: KanbanEntityType;
  title: string;
  subtitle?: string;
  value?: number;
  status: string;
  raw: Lead | Offer | Sale;
}
