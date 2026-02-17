import type { GridColumnDef } from "@kerzz/grid";
import type { UninvoicedItem } from "../types/uninvoiced-items.types";
import { CATEGORY_INFO } from "../types/uninvoiced-items.types";

export const uninvoicedItemsColumns: GridColumnDef<UninvoicedItem>[] = [
  {
    id: "contractNo",
    accessorKey: "contractNo",
    header: "Kontrat No",
    width: 110,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono",
  },
  {
    id: "company",
    accessorKey: "company",
    header: "Firma",
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: { type: "input" },
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Kategori",
    width: 160,
    minWidth: 120,
    sortable: true,
    filter: { type: "dropdown" },
    cell: (value) => {
      const category = value as UninvoicedItem["category"];
      return CATEGORY_INFO[category]?.label || category;
    },
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Açıklama",
    width: 300,
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
  },
  {
    id: "contractId",
    accessorKey: "contractId",
    header: "Kontrat ID",
    width: 120,
    filter: { type: "dropdown" },
  },
  {
    id: "id",
    accessorKey: "id",
    header: "Kalem ID",
    width: 140,
  },
];
