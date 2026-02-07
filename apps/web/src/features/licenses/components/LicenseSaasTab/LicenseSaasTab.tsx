import { useMemo } from "react";
import { useSoftwareProducts } from "../../../software-products";
import type { LicenseItem } from "../../types";
import type { ProductOption } from "../LicenseItemsGrid/ProductAutocompleteEditor";
import { LicenseItemsGrid } from "../LicenseItemsGrid";

interface LicenseSaasTabProps {
  /** Mevcut SaaS öğeleri */
  items: LicenseItem[];
  /** SaaS listesi değiştiğinde çağrılır */
  onItemsChange: (items: LicenseItem[]) => void;
}

/**
 * SaaS kiralamalarını yöneten sekme bileşeni.
 * Sadece SaaS olarak işaretlenmiş aktif yazılım ürünlerini gösterir.
 */
export function LicenseSaasTab({ items, onItemsChange }: LicenseSaasTabProps) {
  // Sadece SaaS ve aktif ürünleri getir
  const { data: productsData, isLoading } = useSoftwareProducts({
    isSaas: true,
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
