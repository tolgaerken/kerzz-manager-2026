import { Grid } from "@kerzz/grid";
import { notificationHistoryColumnDefs } from "./columnDefs.tsx";
import type { NotificationLog } from "../../types";

interface NotificationHistoryGridProps {
  data: NotificationLog[];
  loading: boolean;
}

export function NotificationHistoryGrid({
  data,
  loading,
}: NotificationHistoryGridProps) {
  return (
    <div className="h-full w-full flex-1">
      <Grid<NotificationLog>
        data={data}
        columns={notificationHistoryColumnDefs}
        loading={loading}
        height="100%"
        locale="tr"
        getRowId={(row) => row._id}
        selectionMode="none"
        stateKey="notification-history-grid"
      />
    </div>
  );
}
