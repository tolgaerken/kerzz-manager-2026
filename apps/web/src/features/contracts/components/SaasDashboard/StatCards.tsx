import {
  Boxes,
  Hash,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
  CalendarCheck,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import { StatCard } from "../shared/dashboard/StatCard";
import { formatCurrency } from "../shared/dashboard/currency";
import type { SaasStats } from "./useSaasStats";

interface StatCardsProps {
  stats: SaasStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const generalCards = [
    { label: "Toplam SAAS", value: stats.total, icon: Boxes, colorVar: "--color-primary" },
    { label: "Toplam Adet", value: stats.totalQty, icon: Hash, colorVar: "--color-info" },
    { label: "Aktif", value: stats.active, icon: CheckCircle2, colorVar: "--color-success" },
    { label: "Pasif", value: stats.passive, icon: XCircle, colorVar: "--color-error" },
    { label: "Engelli", value: stats.blocked, icon: Ban, colorVar: "--color-warning" },
    { label: "Suresi Dolmus", value: stats.expired, icon: Clock, colorVar: "--color-info" },
  ];

  const periodCards = [
    { label: "Yillik", value: stats.yearly, icon: CalendarCheck, colorVar: "--color-success" },
    { label: "Aylik", value: stats.monthly, icon: CalendarClock, colorVar: "--color-info" },
  ];

  const yearlyTotalCards = [
    {
      label: "Yillik TL",
      value: formatCurrency(stats.yearlyByTotal.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Yillik USD",
      value: formatCurrency(stats.yearlyByTotal.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Yillik EUR",
      value: formatCurrency(stats.yearlyByTotal.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  const monthlyTotalCards = [
    {
      label: "Aylik TL",
      value: formatCurrency(stats.monthlyByTotal.tl, "tl"),
      icon: DollarSign,
      colorVar: "--color-primary",
      small: true,
    },
    {
      label: "Aylik USD",
      value: formatCurrency(stats.monthlyByTotal.usd, "usd"),
      icon: DollarSign,
      colorVar: "--color-success",
      small: true,
    },
    {
      label: "Aylik EUR",
      value: formatCurrency(stats.monthlyByTotal.eur, "eur"),
      icon: DollarSign,
      colorVar: "--color-warning",
      small: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {generalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {periodCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {yearlyTotalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
        {monthlyTotalCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
