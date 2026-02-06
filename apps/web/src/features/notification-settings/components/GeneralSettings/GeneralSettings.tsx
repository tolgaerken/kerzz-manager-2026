import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { useNotificationSettings, useUpdateNotificationSettings } from "../../hooks";

export function GeneralSettings() {
  const { data: settings, isLoading, refetch } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();

  const [formData, setFormData] = useState({
    invoiceDueReminderDays: [0],
    invoiceOverdueDays: [3, 5, 10],
    invoiceLookbackDays: 90,
    contractExpiryDays: [30, 15, 7],
    emailEnabled: true,
    smsEnabled: false,
    cronTime: "09:00",
    cronEnabled: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        invoiceDueReminderDays: settings.invoiceDueReminderDays,
        invoiceOverdueDays: settings.invoiceOverdueDays,
        invoiceLookbackDays: settings.invoiceLookbackDays ?? 90,
        contractExpiryDays: settings.contractExpiryDays,
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        cronTime: settings.cronTime,
        cronEnabled: settings.cronEnabled,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(formData);
  };

  const handleDaysChange = (
    field: "invoiceDueReminderDays" | "invoiceOverdueDays" | "contractExpiryDays",
    value: string
  ) => {
    const days = value
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    setFormData((prev) => ({ ...prev, [field]: days }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Cron Ayarları */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Cron Ayarları
        </h3>

        <div className="flex items-center justify-between">
          <label className="text-sm text-[var(--color-muted)]">
            Otomatik Bildirim Aktif
          </label>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, cronEnabled: !prev.cronEnabled }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.cronEnabled
                ? "bg-[var(--color-primary)]"
                : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.cronEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Çalışma Saati (HH:mm)
          </label>
          <input
            type="time"
            value={formData.cronTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cronTime: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          />
        </div>
      </div>

      {/* Bildirim Kanalları */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Bildirim Kanalları
        </h3>

        <div className="flex items-center justify-between">
          <label className="text-sm text-[var(--color-muted)]">
            E-posta Bildirimi
          </label>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, emailEnabled: !prev.emailEnabled }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.emailEnabled
                ? "bg-[var(--color-primary)]"
                : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.emailEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-[var(--color-muted)]">
            SMS Bildirimi
          </label>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, smsEnabled: !prev.smsEnabled }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.smsEnabled
                ? "bg-[var(--color-primary)]"
                : "bg-[var(--color-border)]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.smsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fatura Hatırlatma Günleri */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Fatura Hatırlatma Günleri
        </h3>

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Son Ödeme Günü Hatırlatması (0 = vade günü)
          </label>
          <input
            type="text"
            value={formData.invoiceDueReminderDays.join(", ")}
            onChange={(e) =>
              handleDaysChange("invoiceDueReminderDays", e.target.value)
            }
            placeholder="0"
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Vadesi Geçmiş Hatırlatma Günleri (virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.invoiceOverdueDays.join(", ")}
            onChange={(e) =>
              handleDaysChange("invoiceOverdueDays", e.target.value)
            }
            placeholder="3, 5, 10"
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Örnek: 3, 5, 10 (Vadesi geçtikten 3, 5 ve 10 gün sonra bildirim gönderilir)
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Geriye Dönük Maksimum Tarama Süresi (gün)
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={formData.invoiceLookbackDays}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) {
                setFormData((prev) => ({ ...prev, invoiceLookbackDays: val }));
              }
            }}
            placeholder="90"
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Ödenmemiş faturalar için en fazla kaç gün geriye dönük tarama yapılacağını belirler. Varsayılan: 90 gün
          </p>
        </div>
      </div>

      {/* Kontrat Hatırlatma Günleri */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Kontrat Bitiş Hatırlatma Günleri
        </h3>

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Bitiş Öncesi Hatırlatma Günleri (virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.contractExpiryDays.join(", ")}
            onChange={(e) =>
              handleDaysChange("contractExpiryDays", e.target.value)
            }
            placeholder="30, 15, 7"
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Örnek: 30, 15, 7 (Bitiş tarihinden 30, 15 ve 7 gün önce bildirim gönderilir)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Kaydet
        </button>
      </div>

      {updateMutation.isSuccess && (
        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
          Ayarlar başarıyla kaydedildi.
        </div>
      )}

      {updateMutation.isError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
          Hata: {updateMutation.error?.message}
        </div>
      )}
    </form>
  );
}
