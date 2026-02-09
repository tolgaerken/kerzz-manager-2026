import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  DollarSign,
} from "lucide-react";
import { StatCard } from "../shared/dashboard/StatCard";
import { formatCurrency } from "../shared/dashboard/currency";
import type { VersionsStats } from "./useVersionsStats";

interface StatCardsProps {
  stats: VersionsStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const generalCards = [
    { label: "Toplam Versiyon", value: stats.total, icon: FileText, colorVar: "--color-primary" },
    { label: "Aktif", value: stats.active, icon: CheckCircle2, colorVar: "--color-success" },
    { label: "Pasif", value: stats.passive, icon: XCircle, colorVar: "--color-error" },
    { label: "Suresi Dolmus", value: stats.expired, icon: Clock, colorVar: "--color-warning" },
  ];

  const primaryTypes = stats.typeDistribution.slice(0, 4);
  const extraCount = stats.typeDistribution.slice(4).reduce((sum, item) => sum + item.count, 0);
  const typeCards = [
    ...primaryTypes.map((item) => ({
      label: item.name,
      value: item.count,
      icon: Layers,
      colorVar: "--color-info",
    })),
    ...(extraCount > 0
      ? [
          {
            label: "Diger",
            value: extraCount,
            icon: Layers,
            colorVar: "--color-muted-foreground",
          },
        ]
      : []),
  ];

  const currencyCards = [
    {
      label: "Toplam TL",
      value: formatCurrency(stats.totalByPrice.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Toplam USD",
      value: formatCurrency(stats.totalByPrice.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Toplam EUR",
      value: formatCurrency(stats.totalByPrice.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {generalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {typeCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {typeCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {currencyCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
