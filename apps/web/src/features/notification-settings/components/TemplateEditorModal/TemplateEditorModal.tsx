import { useState, useEffect, useMemo } from "react";
import { X, Save, RefreshCw, Plus, Eye, EyeOff } from "lucide-react";
import { useUpdateNotificationTemplate } from "../../hooks";
import type { NotificationTemplate, UpdateNotificationTemplateDto } from "../../types";

interface TemplateEditorModalProps {
  isOpen: boolean;
  template: NotificationTemplate;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_VARIABLES = [
  { name: "company", description: "Şirket adı" },
  { name: "customerName", description: "Müşteri adı" },
  { name: "invoiceNumber", description: "Fatura numarası" },
  { name: "amount", description: "Tutar" },
  { name: "dueDate", description: "Son ödeme tarihi" },
  { name: "overdueDays", description: "Geciken gün sayısı" },
  { name: "paymentLink", description: "Ödeme linki" },
  { name: "confirmLink", description: "Onay linki" },
  { name: "contractEndDate", description: "Kontrat bitiş tarihi" },
  { name: "remainingDays", description: "Kalan gün sayısı" },
];

// Örnek veriler - önizleme için
const SAMPLE_DATA: Record<string, string> = {
  company: "Örnek Şirket A.Ş.",
  customerName: "Ahmet Yılmaz",
  invoiceNumber: "FT-2026-00123",
  amount: "5.250,00 TL",
  dueDate: "15.02.2026",
  overdueDays: "5",
  paymentLink: "https://pay.kerzz.com/example-token",
  confirmLink: "https://manager.kerzz.com/confirm/example-token",
  contractEndDate: "31.03.2026",
  remainingDays: "30",
};

/**
 * Handlebars benzeri basit template render
 */
function renderTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

export function TemplateEditorModal({
  isOpen,
  template,
  onClose,
  onSuccess,
}: TemplateEditorModalProps) {
  const updateMutation = useUpdateNotificationTemplate();
  const [showPreview, setShowPreview] = useState(true);

  const [formData, setFormData] = useState<UpdateNotificationTemplateDto>({
    name: "",
    subject: "",
    body: "",
    isActive: true,
    description: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        isActive: template.isActive,
        description: template.description || "",
      });
    }
  }, [template]);

  // Canlı önizleme - body ve subject render
  const preview = useMemo(() => {
    return {
      subject: formData.subject ? renderTemplate(formData.subject, SAMPLE_DATA) : "",
      body: renderTemplate(formData.body || "", SAMPLE_DATA),
    };
  }, [formData.subject, formData.body]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: template._id,
      dto: formData,
    });
    onSuccess();
  };

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    setFormData((prev) => ({
      ...prev,
      body: prev.body + variable,
    }));
  };

  const getSmsCharCount = () => {
    return (formData.body || "").length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`relative w-full max-h-[90vh] bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
        showPreview && template.channel === "email" ? "max-w-7xl" : "max-w-4xl"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Şablon Düzenle: {template.name}
          </h2>
          <div className="flex items-center gap-2">
            {template.channel === "email" && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  showPreview
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"
                }`}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Önizlemeyi Gizle" : "Önizleme"}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className={`grid gap-6 p-6 ${
            showPreview && template.channel === "email" ? "grid-cols-2" : "grid-cols-1"
          }`}>
            {/* Left: Editor */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Form Fields */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                      Şablon Adı
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                    />
                  </div>

                  {template.channel === "email" && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                        E-posta Konusu
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="{{company}} - Fatura Hatırlatması"
                        className="w-full px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-[var(--color-foreground)]">
                        {template.channel === "email" ? "E-posta İçeriği (HTML)" : "SMS İçeriği"}
                      </label>
                      {template.channel === "sms" && (
                        <span
                          className={`text-xs ${
                            getSmsCharCount() > 160
                              ? "text-red-500"
                              : "text-[var(--color-muted)]"
                          }`}
                        >
                          {getSmsCharCount()} / 160 karakter
                        </span>
                      )}
                    </div>
                    <textarea
                      value={formData.body}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, body: e.target.value }))
                      }
                      rows={template.channel === "email" ? 16 : 6}
                      className="w-full px-3 py-2 text-sm font-mono bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                    />
                    {template.channel === "sms" && getSmsCharCount() > 160 && (
                      <p className="mt-1 text-xs text-red-500">
                        SMS 160 karakterden uzun olduğu için birden fazla mesaj olarak gönderilecektir.
                      </p>
                    )}
                  </div>

                  {/* SMS Preview */}
                  {template.channel === "sms" && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                        SMS Önizleme
                      </label>
                      <div className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-[var(--color-foreground)]">
                        {preview.body || <span className="text-[var(--color-muted)]">Önizleme için içerik girin...</span>}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                      Açıklama
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-[var(--color-foreground)]"
                    >
                      Şablon Aktif
                    </label>
                  </div>
                </div>

                {/* Variables */}
                <div className="space-y-4">
                  <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-3">
                      Değişkenler
                    </h4>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <button
                          key={variable.name}
                          type="button"
                          onClick={() => insertVariable(variable.name)}
                          className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-left bg-[var(--color-surface)] rounded hover:bg-[var(--color-border)] transition-colors"
                        >
                          <div>
                            <span className="font-mono text-xs text-[var(--color-primary)]">
                              {`{{${variable.name}}}`}
                            </span>
                            <p className="text-xs text-[var(--color-muted)]">
                              {variable.description}
                            </p>
                          </div>
                          <Plus className="w-3 h-3 text-[var(--color-muted)]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview (Email only) */}
            {showPreview && template.channel === "email" && (
              <div className="space-y-4">
                <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-[var(--color-primary)]" />
                    <h4 className="text-sm font-medium text-[var(--color-foreground)]">
                      Canlı Önizleme
                    </h4>
                  </div>
                  
                  {/* Subject Preview */}
                  {preview.subject && (
                    <div className="mb-3">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Konu:</p>
                      <p className="text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface)] px-3 py-2 rounded">
                        {preview.subject}
                      </p>
                    </div>
                  )}

                  {/* Body Preview */}
                  <div>
                    <p className="text-xs text-[var(--color-muted)] mb-1">İçerik:</p>
                    <div 
                      className="bg-white rounded border border-[var(--color-border)] p-4 max-h-[500px] overflow-auto"
                      style={{ minHeight: "300px" }}
                    >
                      {preview.body ? (
                        <div dangerouslySetInnerHTML={{ __html: preview.body }} />
                      ) : (
                        <p className="text-[var(--color-muted)] text-center py-8">
                          Önizleme için içerik girin...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sample Data Info */}
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
                    💡 Önizleme örnek verilerle gösterilmektedir
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
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
      </div>
    </div>
  );
}
