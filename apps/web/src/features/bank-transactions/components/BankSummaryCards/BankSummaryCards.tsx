import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import type { BankSummaryResponse } from "../../types";

interface BankSummaryCardsProps {
  data: BankSummaryResponse | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function BankSummaryCards({ data, isLoading }: BankSummaryCardsProps) {
  const totals = useMemo(() => {
    if (!data) {
      return { inflow: 0, outflow: 0, balance: 0, count: 0 };
    }
    return {
      inflow: data.totalInflow,
      outflow: data.totalOutflow,
      balance: data.totalBalance,
      count: data.transactionCount,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-border bg-surface animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Genel Ozet Kartlari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Giris */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">
                Toplam Giriş
              </p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(totals.inflow)}
              </p>
            </div>
            <div className="rounded-full bg-success/20 p-3">
              <ArrowDownLeft className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        {/* Cikis */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">
                Toplam Çıkış
              </p>
              <p className="text-2xl font-bold text-error">
                {formatCurrency(totals.outflow)}
              </p>
            </div>
            <div className="rounded-full bg-error/20 p-3">
              <ArrowUpRight className="h-5 w-5 text-error" />
            </div>
          </div>
        </div>

        {/* Net Bakiye */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">
                Net Bakiye ({totals.count} işlem)
              </p>
              <p
                className={`text-2xl font-bold ${
                  totals.balance >= 0 ? "text-info" : "text-warning"
                }`}
              >
                {formatCurrency(totals.balance)}
              </p>
            </div>
            <div className="rounded-full bg-info/20 p-3">
              <Wallet className="h-5 w-5 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Banka Bazli Kartlar */}
      {data && data.summaries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {data.summaries.map((bank) => (
            <div
              key={bank.bankAccId}
              className="rounded-lg border border-border bg-surface p-3 hover:bg-surface-hover transition-colors"
            >
              <p className="text-xs font-medium text-muted truncate mb-2">
                {bank.bankAccName}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-subtle">Giriş:</span>
                  <span className="text-success font-medium">
                    {formatCurrency(bank.inflow)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtle">Çıkış:</span>
                  <span className="text-error font-medium">
                    {formatCurrency(bank.outflow)}
                  </span>
                </div>
                <hr className="border-border-subtle" />
                <div className="flex justify-between">
                  <span className="text-subtle">Net:</span>
                  <span
                    className={`font-bold ${
                      bank.balance >= 0 ? "text-info" : "text-warning"
                    }`}
                  >
                    {formatCurrency(bank.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
