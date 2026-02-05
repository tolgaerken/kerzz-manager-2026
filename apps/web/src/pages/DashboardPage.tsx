import { useAuth } from "../features/auth";
import { LayoutDashboard, FileText, ShoppingCart, Plug } from "lucide-react";

export function DashboardPage() {
  const { userInfo, activeLicance, isAdmin, isFinance, isManager } = useAuth();

  const stats = [
    { label: "Toplam Kontrat", value: "12", icon: FileText, colorClass: "bg-info/20 text-info" },
    { label: "Aktif Satış", value: "8", icon: ShoppingCart, colorClass: "bg-success/20 text-success" },
    { label: "Entegrasyon", value: "5", icon: Plug, colorClass: "bg-accent/20 text-accent" },
    { label: "Bekleyen İşlem", value: "3", icon: LayoutDashboard, colorClass: "bg-warning/20 text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted">
          Hoş geldiniz, {userInfo?.name}. İşte güncel durumunuz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.colorClass}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kullanıcı Bilgileri */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Kullanıcı Bilgileri</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Ad</dt>
              <dd className="text-foreground">{userInfo?.name ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">E-posta</dt>
              <dd className="text-foreground">{userInfo?.mail ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Telefon</dt>
              <dd className="text-foreground">{userInfo?.phone ?? "-"}</dd>
            </div>
          </dl>
        </div>

        {/* Lisans Bilgileri */}
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Lisans Bilgileri</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Marka</dt>
              <dd className="text-foreground">{activeLicance?.brand ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Lisans ID</dt>
              <dd className="text-foreground">{activeLicance?.licanceId ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Roller</dt>
              <dd className="text-foreground">
                {activeLicance?.roles.map((r) => r.name).join(", ") ?? "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Yetkiler */}
        <div className="rounded-lg border border-border bg-surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Yetkiler</h2>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <span className="rounded-full bg-success/20 px-4 py-1.5 text-sm font-medium text-success">
                Yönetici
              </span>
            )}
            {isFinance && (
              <span className="rounded-full bg-info/20 px-4 py-1.5 text-sm font-medium text-info">
                Finans
              </span>
            )}
            {isManager && (
              <span className="rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
                Müdür
              </span>
            )}
            {!isAdmin && !isFinance && !isManager && (
              <span className="text-sm text-muted">Standart kullanıcı</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
