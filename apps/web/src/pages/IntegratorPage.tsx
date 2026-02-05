import { Plug, CheckCircle, XCircle, RefreshCw, Settings } from "lucide-react";

export function IntegratorPage() {
  const integrations = [
    { 
      id: 1, 
      name: "API Gateway", 
      status: "connected", 
      lastSync: "5 dakika önce",
      description: "Ana API bağlantısı"
    },
    { 
      id: 2, 
      name: "Payment Provider", 
      status: "connected", 
      lastSync: "10 dakika önce",
      description: "Ödeme sistemi entegrasyonu"
    },
    { 
      id: 3, 
      name: "SMS Service", 
      status: "disconnected", 
      lastSync: "1 saat önce",
      description: "SMS gönderim servisi"
    },
    { 
      id: 4, 
      name: "Email Service", 
      status: "connected", 
      lastSync: "2 dakika önce",
      description: "E-posta servisi"
    },
    { 
      id: 5, 
      name: "Analytics", 
      status: "pending", 
      lastSync: "Hiç",
      description: "Analitik platformu"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "disconnected":
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <RefreshCw className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Bağlı";
      case "disconnected":
        return "Bağlantı Kesildi";
      default:
        return "Beklemede";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-success/20 text-success";
      case "disconnected":
        return "bg-error/20 text-error";
      default:
        return "bg-warning/20 text-warning";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entegratör</h1>
          <p className="mt-1 text-muted">
            Sistem entegrasyonlarınızı yönetin ve izleyin.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
          <Plug className="h-4 w-4" />
          Yeni Entegrasyon
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-surface-elevated p-3">
                  <Plug className="h-5 w-5 text-muted" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <p className="text-sm text-muted">{integration.description}</p>
                </div>
              </div>
              <button className="rounded p-1 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(integration.status)}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
              </div>
              <span className="text-xs text-subtle">
                Son sync: {integration.lastSync}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg border border-border-subtle bg-surface-elevated py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                Test Et
              </button>
              <button className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
                Yenile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
