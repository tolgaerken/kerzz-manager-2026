import { ShoppingCart, TrendingUp, DollarSign, Users } from "lucide-react";

export function SalesPage() {
  const salesStats = [
    { label: "Toplam Satış", value: "₺125,430", icon: DollarSign, change: "+12.5%", positive: true },
    { label: "Siparişler", value: "89", icon: ShoppingCart, change: "+8.2%", positive: true },
    { label: "Müşteriler", value: "45", icon: Users, change: "+5.1%", positive: true },
    { label: "Ortalama Sipariş", value: "₺1,409", icon: TrendingUp, change: "-2.3%", positive: false },
  ];

  const recentSales = [
    { id: 1, customer: "Müşteri A", product: "Ürün X", amount: "₺2,500", date: "Bugün" },
    { id: 2, customer: "Müşteri B", product: "Ürün Y", amount: "₺1,850", date: "Dün" },
    { id: 3, customer: "Müşteri C", product: "Ürün Z", amount: "₺3,200", date: "2 gün önce" },
    { id: 4, customer: "Müşteri D", product: "Ürün X", amount: "₺950", date: "3 gün önce" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Satış</h1>
        <p className="mt-1 text-muted">
          Satış performansınızı ve siparişlerinizi takip edin.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {salesStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-surface-elevated p-3">
                <stat.icon className="h-5 w-5 text-muted" />
              </div>
              <span
                className={`text-xs font-medium ${
                  stat.positive ? "text-success" : "text-error"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Son Satışlar</h2>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-elevated/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-success/20 p-2">
                  <ShoppingCart className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{sale.customer}</p>
                  <p className="text-sm text-muted">{sale.product}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{sale.amount}</p>
                <p className="text-sm text-muted">{sale.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
