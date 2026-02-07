export function CreditBalanceLegend() {
  const items = [
    {
      label: "TÜKENDİ (< 0)",
      className: "bg-[var(--color-error)]",
    },
    {
      label: "KRİTİK (≤ Aylık Ort.)",
      className: "bg-[var(--color-warning)]",
    },
    {
      label: "DÜŞÜK (≤ 2x Aylık Ort.)",
      className: "bg-[var(--color-warning)]/50",
    },
    {
      label: "< 3 Ay",
      className: "bg-[var(--color-info)]",
    },
    {
      label: "YETERLİ",
      className:
        "bg-transparent border border-[var(--color-border)]",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.className}`}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
