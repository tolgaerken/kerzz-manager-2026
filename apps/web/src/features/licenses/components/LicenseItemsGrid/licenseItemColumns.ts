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
      // moduleId, pid'nin integer hali olarak saklanır; id ve _id ile de eşleştir
      const found = products.find(
        (p) =>
          String(parseInt(p.pid, 10)) === valueStr ||
          p.pid === valueStr ||
          p.id === valueStr ||
          p._id === valueStr
      );
      return found?.nameWithCode || found?.friendlyName || found?.name || String(value);
    }
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
