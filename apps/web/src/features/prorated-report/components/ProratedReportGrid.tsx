import { useMemo } from "react";
import { Grid } from "@kerzz/grid";
import type { ProratedPlan } from "../types/prorated-report.types";
import { proratedReportColumns } from "./proratedReportColumns";

interface ProratedReportGridProps {
  data: ProratedPlan[];
  loading: boolean;
}

export function ProratedReportGrid({ data, loading }: ProratedReportGridProps) {
  const columns = useMemo(() => proratedReportColumns, []);

  return (
    <Grid<ProratedPlan>
      data={data}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id || row._id}
      height="100%"
      locale="tr"
      toolbar={{
        showSearch: true,
        showExcelExport: true,
        showColumnVisibility: true,
        exportFileName: "kist-raporu",
      }}
    />
  );
}
