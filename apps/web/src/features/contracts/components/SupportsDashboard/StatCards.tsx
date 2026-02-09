import {
  LifeBuoy,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  CalendarCheck,
  CalendarClock,
  Star,
  Crown,
  Gem,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { StatCard } from "../shared/dashboard/StatCard";
import { formatCurrency } from "../shared/dashboard/currency";
import type { SupportsStats } from "./useSupportsStats";

interface StatCardsProps {
  stats: SupportsStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const generalCards = [
    { label: "Toplam Destek", value: stats.total, icon: LifeBuoy, colorVar: "--color-primary" },
    { label: "Aktif", value: stats.active, icon: CheckCircle2, colorVar: "--color-success" },
    { label: "Pasif", value: stats.passive, icon: XCircle, colorVar: "--color-error" },
    { label: "Engelli", value: stats.blocked, icon: Ban, colorVar: "--color-warning" },
    { label: "Suresi Dolmus", value: stats.expired, icon: Clock, colorVar: "--color-info" },
  ];

  const periodCards = [
    { label: "Yillik", value: stats.yearly, icon: CalendarCheck, colorVar: "--color-success" },
    { label: "Aylik", value: stats.monthly, icon: CalendarClock, colorVar: "--color-info" },
  ];

  const typeCards = [
    { label: "Standart", value: stats.typeCounts.standart, icon: Star, colorVar: "--color-primary" },
    { label: "Gold", value: stats.typeCounts.gold, icon: Crown, colorVar: "--color-warning" },
    { label: "Platin", value: stats.typeCounts.platin, icon: Gem, colorVar: "--color-info" },
    { label: "VIP", value: stats.typeCounts.vip, icon: Sparkles, colorVar: "--color-success" },
  ];

  const yearlyPriceCards = [
    {
      label: "Yillik TL",
      value: formatCurrency(stats.yearlyByPrice.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Yillik USD",
      value: formatCurrency(stats.yearlyByPrice.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Yillik EUR",
      value: formatCurrency(stats.yearlyByPrice.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  const monthlyPriceCards = [
    {
      label: "Aylik TL",
      value: formatCurrency(stats.monthlyByPrice.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Aylik USD",
      value: formatCurrency(stats.monthlyByPrice.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Aylik EUR",
      value: formatCurrency(stats.monthlyByPrice.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {generalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {periodCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        {typeCards.slice(0, 2).map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {typeCards.slice(2).map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {yearlyPriceCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        {monthlyPriceCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
