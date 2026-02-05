import { useAuth } from "../features/auth";
import { useNavigate } from "@tanstack/react-router";

export function LandingPage() {
  const navigate = useNavigate();
  const { userInfo, activeLicance, isAdmin, isFinance, isManager, logout } = useAuth();

  function handleLogout() {
    logout();
    void navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Kerzz Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted">{userInfo?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-surface-elevated px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Hoş Geldiniz</h2>
            <p className="text-muted">
              Başarıyla giriş yaptınız. Aşağıda hesap bilgilerinizi görebilirsiniz.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-elevated/50 p-6">
              <h3 className="mb-4 text-lg font-medium">Kullanıcı Bilgileri</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Ad</dt>
                  <dd>{userInfo?.name ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">E-posta</dt>
                  <dd>{userInfo?.mail ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Telefon</dt>
                  <dd>{userInfo?.phone ?? "-"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/50 p-6">
              <h3 className="mb-4 text-lg font-medium">Lisans Bilgileri</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Marka</dt>
                  <dd>{activeLicance?.brand ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Lisans ID</dt>
                  <dd>{activeLicance?.licanceId ?? "-"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Roller</dt>
                  <dd>{activeLicance?.roles.map((r) => r.name).join(", ") ?? "-"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-surface-elevated/50 p-6 md:col-span-2">
              <h3 className="mb-4 text-lg font-medium">Yetkiler</h3>
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <span className="rounded bg-success/20 px-3 py-1 text-sm text-success">
                    Yönetici
                  </span>
                )}
                {isFinance && (
                  <span className="rounded bg-info/20 px-3 py-1 text-sm text-info">
                    Finans
                  </span>
                )}
                {isManager && (
                  <span className="rounded bg-accent/20 px-3 py-1 text-sm text-accent">
                    Müdür
                  </span>
                )}
                {!isAdmin && !isFinance && !isManager && (
                  <span className="text-sm text-muted">Standart kullanıcı</span>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
