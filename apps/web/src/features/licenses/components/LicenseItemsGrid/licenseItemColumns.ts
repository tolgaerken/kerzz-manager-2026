import type { GridColumnDef } from "@kerzz/grid";
import type { LicenseItem } from "../../types";
import { ProductAutocompleteEditor } from "./ProductAutocompleteEditor";
import type { ProductOption } from "./ProductAutocompleteEditor";

/**
 * Lisans modülleri ve SaaS sekmeleri için paylaşılan kolon tanımları.
 * Grid context'inde `products: ProductOption[]` bekler.
 */
export const licenseItemColumns: GridColumnDef<LicenseItem>[] = [
  {
    id: "moduleId",
    accessorKey: "moduleId",
    header: "Ürün",
    width: 350,
    editable: true,
    cellEditor: {
      type: "custom",
      customEditor: ProductAutocompleteEditor
    },
    cell: (value, _row, context) => {
      if (!value) return "";
      const valueStr = String(value);
      const products =
        ((context as Record<string, unknown>)?.products as ProductOption[]) || [];
      const found = products.find((p) => p.id === valueStr);
      return found?.nameWithCode || found?.friendlyName || found?.name || String(value);
    }
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Modül Adı",
    width: 250,
    editable: false
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Adet",
    width: 100,
    align: "right",
    editable: true,
    cellEditor: { type: "number" }
  }
];
