import { useMemo } from "react";
import { Grid } from "@kerzz/grid";
import type { ToolbarButtonConfig, ToolbarConfig } from "@kerzz/grid";
import type { ProratedPlan } from "../types/prorated-report.types";
import { proratedReportColumns } from "./proratedReportColumns";

interface ProratedReportGridProps {
  data: ProratedPlan[];
  loading: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  toolbarButtons?: ToolbarButtonConfig[];
}

export function ProratedReportGrid({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  toolbarButtons,
}: ProratedReportGridProps) {
  const columns = useMemo(() => proratedReportColumns, []);
  const toolbarConfig = useMemo<ToolbarConfig<ProratedPlan>>(
    () => ({
      showSearch: true,
      showExcelExport: true,
      showColumnVisibility: true,
      exportFileName: "kist-raporu",
      customButtons: toolbarButtons ?? [],
    }),
    [toolbarButtons],
  );

  return (
    <Grid<ProratedPlan>
      data={data}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id || row._id}
      selectionMode="multiple"
      selectionCheckbox
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      height="100%"
      locale="tr"
      toolbar={toolbarConfig}
    />
  );
}
