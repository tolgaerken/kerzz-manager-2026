import { Loader2 } from "lucide-react";
import { useCashRegisterStats } from "./useCashRegisterStats";
import { StatCards } from "./StatCards";
import { TimeBasedCards } from "./TimeBasedCards";
import { CashRegisterCharts } from "./CashRegisterCharts";

interface CashRegisterDashboardProps {
  contractId?: string;
}

export function CashRegisterDashboard({ contractId }: CashRegisterDashboardProps) {
  const { stats, isLoading } = useCashRegisterStats(contractId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--color-muted-foreground)]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* İstatistik Kartları */}
      <StatCards stats={stats} />

      {/* Zaman Bazlı Kartlar */}
      <TimeBasedCards
        today={stats.today}
        thisMonth={stats.thisMonth}
        thisYear={stats.thisYear}
      />

      {/* Grafikler */}
      <CashRegisterCharts stats={stats} />
    </div>
  );
}
