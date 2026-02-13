import { useMemo } from "react";
import { Grid } from "@kerzz/grid";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { StatusMobileList } from "./StatusMobileList";
import { getColumnDefs } from "./columnDefs";
import type { IntegratorStatusItem } from "../../types";

interface EDocStatusesGridProps {
  data: IntegratorStatusItem[];
  loading: boolean;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export function EDocStatusesGrid({
  data,
  loading,
  onScrollDirectionChange,
}: EDocStatusesGridProps) {
  const isMobile = useIsMobile();

  const columns = useMemo(() => getColumnDefs(), []);

  // Mobile view
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <StatusMobileList
          data={data}
          loading={loading}
          onScrollDirectionChange={onScrollDirectionChange}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="flex-1 min-h-0">
      <Grid<IntegratorStatusItem>
        data={data}
        columns={columns}
        loading={loading}
        height="100%"
        locale="tr"
        stateKey="e-doc-statuses-grid"
        getRowId={(row) => `${row.taxpayerVknTckn}-${row.date}`}
        toolbar={{ exportFileName: "e-belge-durumlari" }}
      />
    </div>
  );
}
