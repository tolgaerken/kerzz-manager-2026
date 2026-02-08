import { useCallback, useMemo, useEffect, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { createLicenseColumnDefs } from "./columnDefs";
import type { License } from "../../types";
import { useCustomers } from "../../../customers";
import type { Customer } from "../../../customers";

interface LicensesGridProps {
  data: License[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (license: License) => void;
}

export function LicensesGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: LicensesGridProps) {
  const [customerMap, setCustomerMap] = useState<Map<string, Customer>>(new Map());

  // License'lardan unique customerId'leri çıkar
  const customerIds = useMemo(() => {
    const ids = new Set<string>();
    data.forEach(license => {
      if (license.customerId) {
        ids.add(license.customerId);
      }
    });
    return Array.from(ids);
  }, [data]);

  // Customer'ları fetch et - TÜM customer'ları çek (limit yok gibi)
  const { data: customersData } = useCustomers({
    limit: 999999, // Tüm customer'ları çekmek için çok yüksek limit
  });

  // Customer map'i oluştur
  useEffect(() => {
    if (customersData?.data) {
      const map = new Map<string, Customer>();
      customersData.data.forEach(customer => {
        // _id ile ekle
        map.set(customer._id, customer);
        
        // id ile ekle (trim edilmiş)
        if (customer.id) {
          const trimmedId = customer.id.toString().trim();
          if (trimmedId) {
            map.set(trimmedId, customer);
          }
        }
        
        // erpId ile de ekle (bazı sistemlerde erpId kullanılabilir)
        if (customer.erpId) {
          const trimmedErpId = customer.erpId.toString().trim();
          if (trimmedErpId) {
            map.set(trimmedErpId, customer);
          }
        }
      });
      setCustomerMap(map);
    }
  }, [customersData]);

  // Column definitions'ı customerMap ile oluştur
  const columnDefs = useMemo(() => {
    return createLicenseColumnDefs(customerMap);
  }, [customerMap]);

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: License) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  return (
    <div className="h-full w-full flex-1">
      <Grid<License>
        data={data}
        columns={columnDefs}
        height="100%"
        width="100%"
        locale="tr"
        loading={loading}
        stateKey="licenses-grid"
        stateStorage="localStorage"
        getRowId={(row) => row._id}
        stripedRows
        onSortChange={handleSortChange}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{
          showSearch: true,
          showColumnVisibility: true,
          showExcelExport: true,
          showPdfExport: false
        }}
      />
    </div>
  );
}
