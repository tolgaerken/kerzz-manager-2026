import type { ErpBalance } from "../../../erp-balances";

// Para formatı
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

interface ReceivableCardProps {
  item: ErpBalance;
  onClick: () => void;
  selected: boolean;
  onSelect: () => void;
}

export function ReceivableCard({
  item,
  onClick,
  selected,
  onSelect,
}: ReceivableCardProps) {
  const hasOverdue = item.ToplamGecikme > 0;
  const hasBalance = item.CariBakiye > 0;

  return (
    <div
      className={`p-3 border rounded-lg transition-colors cursor-pointer ${
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            <span className="font-mono text-xs text-[var(--color-muted-foreground)]">
              {item.CariKodu}
            </span>
          </div>
          <h3 className="font-medium text-sm text-[var(--color-foreground)] truncate mt-1">
            {item.CariUnvan}
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-muted-foreground)]">
          {item.internalFirm}
        </span>
      </div>

      {/* Bakiye */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--color-muted-foreground)]">Bakiye</span>
        <span
          className={`font-mono font-semibold ${
            hasBalance
              ? "text-[var(--color-error)]"
              : item.CariBakiye < 0
              ? "text-[var(--color-success)]"
              : "text-[var(--color-foreground)]"
          }`}
        >
          {formatCurrency(item.CariBakiye)}
        </span>
      </div>

      {/* Alt Bilgiler */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--color-muted-foreground)]">Vadesi Geçmiş</span>
          <span
            className={`font-mono ${
              hasOverdue ? "text-[var(--color-error)] font-semibold" : ""
            }`}
          >
            {formatCurrency(item.ToplamGecikme)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted-foreground)]">Vadesi Gelmemiş</span>
          <span className="font-mono">{formatCurrency(item.VadesiGelmemis)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted-foreground)]">Bugün</span>
          <span
            className={`font-mono ${
              item.Bugun > 0 ? "text-[var(--color-warning)]" : ""
            }`}
          >
            {formatCurrency(item.Bugun)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-muted-foreground)]">Gecikme</span>
          <span
            className={`font-mono ${
              item.GECIKMEGUN > 30
                ? "text-[var(--color-error)] font-semibold"
                : item.GECIKMEGUN > 0
                ? "text-[var(--color-warning)]"
                : ""
            }`}
          >
            {item.GECIKMEGUN > 0 ? `${item.GECIKMEGUN} gün` : "—"}
          </span>
        </div>
      </div>

      {/* Grup */}
      {item.GrupKodu && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Grup: {item.GrupKodu}
          </span>
        </div>
      )}
    </div>
  );
}
