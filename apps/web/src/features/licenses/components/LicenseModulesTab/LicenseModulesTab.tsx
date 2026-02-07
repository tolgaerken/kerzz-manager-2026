import { useMemo } from "react";
import { useSoftwareProducts } from "../../../software-products";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "../LicenseItemsGrid/ProductAutocompleteEditor";
import { LicenseItemsGrid } from "../LicenseItemsGrid";

interface LicenseModulesTabProps {
  /** Mevcut lisans modülleri */
  items: LicenseItem[];
  /** Modül listesi değiştiğinde çağrılır */
  onItemsChange: (items: LicenseItem[]) => void;
}

/**
 * Lisans modüllerini yöneten sekme bileşeni.
 * Tüm aktif yazılım ürünlerinden modül seçimi yapılmasını sağlar.
 */
export function LicenseModulesTab({ items, onItemsChange }: LicenseModulesTabProps) {
  // Tüm aktif ürünleri getir (SaaS olmayanlar dahil)
  const { data: productsData, isLoading } = useSoftwareProducts({
    saleActive: true,
    limit: 10000,
    sortField: "name",
    sortOrder: "asc"
  });

  // Ürünleri grid için hazırla
  const products: ProductOption[] = useMemo(() => {
    return (
      productsData?.data?.map((p) => ({
        _id: p._id,
        id: p.id,
        name: p.name,
        friendlyName: p.friendlyName,
        nameWithCode: p.nameWithCode
      })) || []
    );
  }, [productsData]);

  return (
    <div className="flex flex-col h-full">
      <LicenseItemsGrid
        items={items}
        onItemsChange={onItemsChange}
        products={products}
        loading={isLoading}
      />
    </div>
  );
}
