import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { useNotificationSettings, useUpdateNotificationSettings } from "../../hooks";

// ── Toggle bileşeni ──
function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <label className="text-sm text-[var(--color-muted)]">{label}</label>
        {description && (
          <p className="text-xs text-[var(--color-muted)]/70 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          checked
            ? "bg-[var(--color-primary)]"
            : "bg-[var(--color-border)]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

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
    invoiceNotificationCronEnabled: true,
    contractNotificationCronEnabled: true,
    proratedInvoiceCronEnabled: true,
    stalePipelineCronEnabled: true,
    managerLogReminderCronEnabled: true,
  });

  // Ham string değerlerini ayrı tutuyoruz ki kullanıcı serbestçe yazabilsin
  const [draftInputs, setDraftInputs] = useState({
    invoiceDueReminderDays: "0",
    invoiceOverdueDays: "3, 5, 10",
    invoiceLookbackDays: "90",
    contractExpiryDays: "30, 15, 7",
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
        invoiceNotificationCronEnabled: settings.invoiceNotificationCronEnabled,
        contractNotificationCronEnabled:
          settings.contractNotificationCronEnabled,
        proratedInvoiceCronEnabled: settings.proratedInvoiceCronEnabled,
        stalePipelineCronEnabled: settings.stalePipelineCronEnabled,
        managerLogReminderCronEnabled: settings.managerLogReminderCronEnabled,
      });
      setDraftInputs({
        invoiceDueReminderDays: settings.invoiceDueReminderDays.join(", "),
        invoiceOverdueDays: settings.invoiceOverdueDays.join(", "),
        invoiceLookbackDays: String(settings.invoiceLookbackDays ?? 90),
        contractExpiryDays: settings.contractExpiryDays.join(", "),
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit öncesi draft değerlerini son kez parse et
    commitDaysField("invoiceDueReminderDays");
    commitDaysField("invoiceOverdueDays");
    commitDaysField("contractExpiryDays");
    commitLookbackField();
    await updateMutation.mutateAsync(formData);
  };

  const parseDays = (value: string): number[] =>
    value
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

  const commitDaysField = (
    field: "invoiceDueReminderDays" | "invoiceOverdueDays" | "contractExpiryDays"
  ) => {
    const days = parseDays(draftInputs[field]);
    if (days.length > 0) {
      setFormData((prev) => ({ ...prev, [field]: days }));
    }
  };

  const commitLookbackField = () => {
    const val = parseInt(draftInputs.invoiceLookbackDays, 10);
    if (!isNaN(val) && val >= 1) {
      setFormData((prev) => ({ ...prev, invoiceLookbackDays: val }));
    }
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
      {/* Genel Cron Ayarları */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Genel Ayarlar
        </h3>

        <ToggleSwitch
          label="Tüm Cron Job'lar Aktif"
          description="Kapatıldığında tüm otomatik görevler durur"
          checked={formData.cronEnabled}
          onChange={(v) => setFormData((prev) => ({ ...prev, cronEnabled: v }))}
        />

        <div>
          <label className="block text-sm text-[var(--color-muted)] mb-1">
            Bildirim Çalışma Saati (HH:mm)
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

      {/* Cron Job Detayları */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Cron Job Yönetimi
        </h3>

        {!formData.cronEnabled && (
          <div className="p-2.5 text-xs bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-md text-[var(--color-warning-foreground)]">
            Genel cron anahtarı kapalı — aşağıdaki ayarlar etkisiz.
          </div>
        )}

        <div className="space-y-3">
          <ToggleSwitch
            label="Fatura Bildirim"
            description="Her gün 09:00 — Vadesi gelen/geçen fatura bildirimleri"
            checked={formData.invoiceNotificationCronEnabled}
            disabled={!formData.cronEnabled}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                invoiceNotificationCronEnabled: v,
              }))
            }
          />

          <div className="border-t border-[var(--color-border)]" />

          <ToggleSwitch
            label="Kontrat Bildirim"
            description="Her gün 09:30 — Bitiş tarihi yaklaşan kontrat bildirimleri"
            checked={formData.contractNotificationCronEnabled}
            disabled={!formData.cronEnabled}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                contractNotificationCronEnabled: v,
              }))
            }
          />

          <div className="border-t border-[var(--color-border)]" />

          <ToggleSwitch
            label="Kıst Fatura"
            description="Her gün 09:00 — Kıst ödeme planlarından otomatik fatura kesimi"
            checked={formData.proratedInvoiceCronEnabled}
            disabled={!formData.cronEnabled}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                proratedInvoiceCronEnabled: v,
              }))
            }
          />

          <div className="border-t border-[var(--color-border)]" />

          <ToggleSwitch
            label="Hareketsiz Pipeline"
            description="Her gün 09:15 — 14 gündür güncellenmemiş lead/teklif bildirimleri"
            checked={formData.stalePipelineCronEnabled}
            disabled={!formData.cronEnabled}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                stalePipelineCronEnabled: v,
              }))
            }
          />

          <div className="border-t border-[var(--color-border)]" />

          <ToggleSwitch
            label="Log Hatırlatma"
            description="Her 15 dakika — Zamanı gelen manager log hatırlatmaları"
            checked={formData.managerLogReminderCronEnabled}
            disabled={!formData.cronEnabled}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                managerLogReminderCronEnabled: v,
              }))
            }
          />
        </div>
      </div>

      {/* Bildirim Kanalları */}
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Bildirim Kanalları
        </h3>

        <ToggleSwitch
          label="E-posta Bildirimi"
          checked={formData.emailEnabled}
          onChange={(v) =>
            setFormData((prev) => ({ ...prev, emailEnabled: v }))
          }
        />

        <ToggleSwitch
          label="SMS Bildirimi"
          checked={formData.smsEnabled}
          onChange={(v) =>
            setFormData((prev) => ({ ...prev, smsEnabled: v }))
          }
        />
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
            value={draftInputs.invoiceDueReminderDays}
            onChange={(e) =>
              setDraftInputs((prev) => ({ ...prev, invoiceDueReminderDays: e.target.value }))
            }
            onBlur={() => commitDaysField("invoiceDueReminderDays")}
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
            value={draftInputs.invoiceOverdueDays}
            onChange={(e) =>
              setDraftInputs((prev) => ({ ...prev, invoiceOverdueDays: e.target.value }))
            }
            onBlur={() => commitDaysField("invoiceOverdueDays")}
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
            value={draftInputs.invoiceLookbackDays}
            onChange={(e) =>
              setDraftInputs((prev) => ({ ...prev, invoiceLookbackDays: e.target.value }))
            }
            onBlur={() => commitLookbackField()}
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
            value={draftInputs.contractExpiryDays}
            onChange={(e) =>
              setDraftInputs((prev) => ({ ...prev, contractExpiryDays: e.target.value }))
            }
            onBlur={() => commitDaysField("contractExpiryDays")}
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
        <div className="p-3 text-sm text-[var(--color-success-foreground)] bg-[var(--color-success)]/10 rounded-md">
          Ayarlar başarıyla kaydedildi.
        </div>
      )}

      {updateMutation.isError && (
        <div className="p-3 text-sm text-[var(--color-error-foreground)] bg-[var(--color-error)]/10 rounded-md">
          Hata: {updateMutation.error?.message}
        </div>
      )}
    </form>
  );
}
