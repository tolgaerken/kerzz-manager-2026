import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import {
  ProratedReportGrid,
  ProratedReportFilters,
  useProratedReport,
} from "../features/prorated-report";
import type { ProratedReportFilter } from "../features/prorated-report";

export function ProratedReportPage() {
  const [filter, setFilter] = useState<ProratedReportFilter>({});
  const { data: response, isLoading } = useProratedReport(filter);

  const plans = response?.data ?? [];

  const totalAmount = useMemo(
    () => plans.reduce((sum, p) => sum + (p.total || 0), 0),
    [plans],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 md:px-6 md:pt-6">
        <Calculator className="h-5 w-5 text-[var(--color-primary)]" />
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
          Kıst Raporu
        </h1>
      </div>

      {/* Filtreler + Özet */}
      <div className="px-3 pb-2 md:px-6">
        <ProratedReportFilters
          filter={filter}
          onChange={setFilter}
          totalCount={plans.length}
          totalAmount={totalAmount}
        />
      </div>

      {/* Grid */}
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 md:px-6 md:pb-6">
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          <ProratedReportGrid data={plans} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
