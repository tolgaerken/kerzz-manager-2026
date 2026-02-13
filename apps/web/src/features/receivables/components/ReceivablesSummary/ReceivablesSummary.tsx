import { useMemo } from "react";
import { Wallet, AlertTriangle, Clock, CalendarCheck, Users, FileX } from "lucide-react";
import type { ErpBalance } from "../../../erp-balances";

interface ReceivablesSummaryProps {
  data: ErpBalance[] | undefined;
  isLoading: boolean;
  /** Müşteri bazında ödenmemiş fatura özeti (CariKodu -> { count, totalAmount }) */
  unpaidMap?: Map<string, { count: number; totalAmount: number }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function ReceivablesSummary({ data, isLoading, unpaidMap }: ReceivablesSummaryProps) {
  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalReceivable: 0,
        totalOverdue: 0,
        totalNotDue: 0,
        totalToday: 0,
        customerCount: 0,
        overdueCustomerCount: 0,
      };
    }

    let totalReceivable = 0;
    let totalOverdue = 0;
    let totalNotDue = 0;
    let totalToday = 0;
    let overdueCustomerCount = 0;

    for (const item of data) {
      // Sadece alacak olanları (bakiye > 0) topla
      if (item.CariBakiye > 0) {
        totalReceivable += item.CariBakiye;
      }
      totalOverdue += item.ToplamGecikme || 0;
      totalNotDue += item.VadesiGelmemis || 0;
      totalToday += item.Bugun || 0;
      if (item.ToplamGecikme > 0) {
        overdueCustomerCount++;
      }
    }

    return {
      totalReceivable,
      totalOverdue,
      totalNotDue,
      totalToday,
      customerCount: data.length,
      overdueCustomerCount,
    };
  }, [data]);

  // Ödenmemiş fatura toplamları (filtrelenmiş müşterilere göre)
  const unpaidTotals = useMemo(() => {
    if (!data || !unpaidMap || unpaidMap.size === 0) {
      return { totalCount: 0, totalAmount: 0 };
    }

    let totalCount = 0;
    let totalAmount = 0;

    for (const item of data) {
      const unpaid = unpaidMap.get(item.CariKodu);
      if (unpaid) {
        totalCount += unpaid.count;
        totalAmount += unpaid.totalAmount;
      }
    }

    return { totalCount, totalAmount };
  }, [data, unpaidMap]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
      {/* Toplam Alacak */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Toplam Alacak
            </p>
            <p className="text-lg font-bold text-[var(--color-error)] truncate">
              {formatCurrency(totals.totalReceivable)}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-error)]/10 p-2 ml-2 flex-shrink-0">
            <Wallet className="h-4 w-4 text-[var(--color-error)]" />
          </div>
        </div>
      </div>

      {/* Vadesi Geçmiş */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Vadesi Geçmiş
            </p>
            <p className="text-lg font-bold text-[var(--color-error)] truncate">
              {formatCurrency(totals.totalOverdue)}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {totals.overdueCustomerCount} müşteri
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-error)]/10 p-2 ml-2 flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-[var(--color-error)]" />
          </div>
        </div>
      </div>

      {/* Vadesi Gelmemiş */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Vadesi Gelmemiş
            </p>
            <p className="text-lg font-bold text-[var(--color-info)] truncate">
              {formatCurrency(totals.totalNotDue)}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-info)]/10 p-2 ml-2 flex-shrink-0">
            <Clock className="h-4 w-4 text-[var(--color-info)]" />
          </div>
        </div>
      </div>

      {/* Bugün Vadesi Gelen */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Bugün Vadesi Gelen
            </p>
            <p className="text-lg font-bold text-[var(--color-warning)] truncate">
              {formatCurrency(totals.totalToday)}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-warning)]/10 p-2 ml-2 flex-shrink-0">
            <CalendarCheck className="h-4 w-4 text-[var(--color-warning)]" />
          </div>
        </div>
      </div>

      {/* Toplam Müşteri */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Toplam Müşteri
            </p>
            <p className="text-lg font-bold text-[var(--color-foreground)] truncate">
              {formatNumber(totals.customerCount)}
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-primary)]/10 p-2 ml-2 flex-shrink-0">
            <Users className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
        </div>
      </div>

      {/* Ödenmemiş Fatura */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
              Ödenmemiş Fatura
            </p>
            <p className="text-lg font-bold text-[var(--color-error)] truncate">
              {formatCurrency(unpaidTotals.totalAmount)}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {formatNumber(unpaidTotals.totalCount)} fatura
            </p>
          </div>
          <div className="rounded-full bg-[var(--color-error)]/10 p-2 ml-2 flex-shrink-0">
            <FileX className="h-4 w-4 text-[var(--color-error)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
