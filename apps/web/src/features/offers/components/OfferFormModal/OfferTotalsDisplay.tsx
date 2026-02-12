import { useMemo } from "react";
import { Calculator, TrendingDown, Receipt, Wallet } from "lucide-react";
import type { CreateOfferInput } from "../../types/offer.types";
import {
  calculateOfferTotals,
  formatCurrency,
  type CurrencyTotal,
} from "../../utils/calculateTotals";

interface OfferTotalsDisplayProps {
  formData: CreateOfferInput;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export function OfferTotalsDisplay({ formData }: OfferTotalsDisplayProps) {
  const totals = useMemo(() => {
    return calculateOfferTotals(
      formData.products || [],
      formData.licenses || [],
      formData.rentals || [],
      formData.payments || [],
      formData.usdRate || 0,
      formData.eurRate || 0
    );
  }, [
    formData.products,
    formData.licenses,
    formData.rentals,
    formData.payments,
    formData.usdRate,
    formData.eurRate,
  ]);

  const hasItems = totals.byCurrency.length > 0;
  const hasPayments = totals.payments.byCurrency.length > 0;
  const hasMultipleCurrencies = totals.byCurrency.length > 1;

  if (!hasItems && !hasPayments) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-[var(--color-primary)]" />
        Teklif Toplamları
      </h3>

      <div className="space-y-4">
        {/* Kur Bazında Toplamlar */}
        {hasItems && (
          <div className="space-y-3">
            {totals.byCurrency.map((curr) => (
              <CurrencyTotalCard key={curr.currency} data={curr} />
            ))}
          </div>
        )}

        {/* Genel Toplam (TRY) - Sadece birden fazla kur varsa göster */}
        {hasMultipleCurrencies && (
          <div className="mt-4 p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                Genel Toplam (TRY)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <TotalItem
                label="Ara Toplam"
                value={formatCurrency(totals.overall.subTotal, "TRY")}
              />
              <TotalItem
                label="İskonto"
                value={formatCurrency(totals.overall.discountTotal, "TRY")}
                isDiscount
              />
              <TotalItem
                label="KDV"
                value={formatCurrency(totals.overall.taxTotal, "TRY")}
              />
              <TotalItem
                label="Genel Toplam"
                value={formatCurrency(totals.overall.grandTotal, "TRY")}
                isTotal
              />
            </div>
          </div>
        )}

        {/* Ödeme Toplamları */}
        {hasPayments && (
          <div className="mt-4 p-4 bg-[var(--color-success)]/5 border border-[var(--color-success)]/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-[var(--color-success)]" />
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                Ödeme Toplamları
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              {totals.payments.byCurrency.map((p) => (
                <div key={p.currency} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {p.currency}:
                  </span>
                  <span className="text-sm font-medium text-[var(--color-success)]">
                    {formatCurrency(p.total, p.currency)}
                  </span>
                </div>
              ))}
              {totals.payments.byCurrency.length > 1 && (
                <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    Toplam (TRY):
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-success)]">
                    {formatCurrency(totals.payments.overall, "TRY")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Alt Bileşenler ---

interface CurrencyTotalCardProps {
  data: CurrencyTotal;
}

function CurrencyTotalCard({ data }: CurrencyTotalCardProps) {
  const symbol = CURRENCY_SYMBOLS[data.currency] || data.currency;

  return (
    <div className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-foreground)] flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded text-xs font-bold">
            {symbol}
          </span>
          {data.currency}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TotalItem
          label="Ara Toplam"
          value={formatCurrency(data.subTotal, data.currency)}
        />
        <TotalItem
          label="İskonto"
          value={formatCurrency(data.discountTotal, data.currency)}
          isDiscount
        />
        <TotalItem
          label="KDV"
          value={formatCurrency(data.taxTotal, data.currency)}
        />
        <TotalItem
          label="Genel Toplam"
          value={formatCurrency(data.grandTotal, data.currency)}
          isTotal
        />
      </div>
    </div>
  );
}

interface TotalItemProps {
  label: string;
  value: string;
  isDiscount?: boolean;
  isTotal?: boolean;
}

function TotalItem({ label, value, isDiscount, isTotal }: TotalItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[var(--color-muted-foreground)] mb-0.5 flex items-center gap-1">
        {isDiscount && <TrendingDown className="w-3 h-3" />}
        {label}
      </span>
      <span
        className={`text-sm font-medium ${
          isDiscount
            ? "text-[var(--color-error)]"
            : isTotal
              ? "text-[var(--color-primary)] font-semibold"
              : "text-[var(--color-foreground)]"
        }`}
      >
        {isDiscount && value !== "₺0,00" && value !== "$0.00" && value !== "€0,00" ? `-${value}` : value}
      </span>
    </div>
  );
}
