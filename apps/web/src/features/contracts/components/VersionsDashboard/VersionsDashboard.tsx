import { Loader2 } from "lucide-react";
import { StatCards } from "./StatCards";
import { VersionsCharts } from "./VersionsCharts";
import { TimeBasedCards } from "../shared/dashboard/TimeBasedCards";
import { useVersionsStats } from "./useVersionsStats";

interface VersionsDashboardProps {
  contractId?: string;
}

export function VersionsDashboard({ contractId }: VersionsDashboardProps) {
  const { stats, isLoading } = useVersionsStats(contractId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--color-muted-foreground)]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      <StatCards stats={stats} />
      <TimeBasedCards today={stats.today} thisMonth={stats.thisMonth} thisYear={stats.thisYear} />
      <VersionsCharts stats={stats} />
    </div>
  );
}
