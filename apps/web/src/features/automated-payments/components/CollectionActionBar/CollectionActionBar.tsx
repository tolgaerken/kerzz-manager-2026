import { useState, useCallback } from "react";
import { Loader2, CreditCard, Wallet, DollarSign } from "lucide-react";

interface CollectionActionBarProps {
  selectedCustomerId: string | null;
  balance: number;
  selectedPlanAmount: number | null;
  onCollectItem: () => void;
  onCollectBalance: () => void;
  onCollectCustomAmount: (amount: number) => void;
  itemLoading: boolean;
  balanceLoading: boolean;
  customLoading: boolean;
}

export function CollectionActionBar({
  selectedCustomerId,
  balance,
  selectedPlanAmount,
  onCollectItem,
  onCollectBalance,
  onCollectCustomAmount,
  itemLoading,
  balanceLoading,
  customLoading,
}: CollectionActionBarProps) {
  const [customAmount, setCustomAmount] = useState<string>("");

  const isDisabled = !selectedCustomerId;
  const isItemDisabled = isDisabled || selectedPlanAmount === null || selectedPlanAmount <= 0;
  const isBalanceDisabled = isDisabled || balance <= 0;
  const parsedCustomAmount = customAmount ? parseFloat(customAmount) : 0;
  const isCustomDisabled = isDisabled || parsedCustomAmount <= 0;

  const handleCustomCollect = useCallback(() => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      onCollectCustomAmount(amount);
      setCustomAmount("");
    }
  }, [customAmount, onCollectCustomAmount]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(value);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Secili Satiri Tahsil Et */}
      <button
        type="button"
        onClick={onCollectItem}
        disabled={isItemDisabled || itemLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {itemLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        Seçili Satırı Tahsil Et
        {selectedPlanAmount !== null && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs">
            {formatCurrency(selectedPlanAmount)}
          </span>
        )}
      </button>

      {/* Cari Bakiyeyi Tahsil Et */}
      <button
        type="button"
        onClick={onCollectBalance}
        disabled={isBalanceDisabled || balanceLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {balanceLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span>Cari Bakiyeyi Tahsil Et</span>
        {balance > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs">
            {formatCurrency(balance)}
          </span>
        )}
      </button>

      {/* Ozel Tahsilat */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Tutar..."
            min="0.01"
            step="0.01"
            disabled={isDisabled}
            className="w-36 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted-foreground)]">
            TL
          </span>
        </div>
        <button
          type="button"
          onClick={handleCustomCollect}
          disabled={isCustomDisabled || customLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {customLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <DollarSign className="w-4 h-4" />
          )}
          Özel Tahsilat
        </button>
      </div>
    </div>
  );
}
