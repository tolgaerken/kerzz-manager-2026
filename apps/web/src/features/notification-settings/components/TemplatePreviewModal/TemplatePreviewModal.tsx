import { useEffect, useState, type FormEvent } from "react";
import { X, RefreshCw, Send } from "lucide-react";
import { useTemplatePreview, useSendTemplateTestEmail } from "../../hooks";
import type { NotificationTemplate } from "../../types";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: NotificationTemplate;
  onClose: () => void;
}

export function TemplatePreviewModal({
  isOpen,
  template,
  onClose,
}: TemplatePreviewModalProps) {
  const { data, isLoading } = useTemplatePreview(isOpen ? template.code : "");
  const sendTestEmailMutation = useSendTemplateTestEmail();
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setRecipientEmail("");
      sendTestEmailMutation.reset();
    }
  }, [isOpen, sendTestEmailMutation]);

  const handleSendTestEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = recipientEmail.trim();
    if (!email) return;

    await sendTestEmailMutation.mutateAsync({
      code: template.code,
      recipientEmail: email,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Önizleme: {template.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info */}
              <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                <span>Kanal: {template.channel === "email" ? "E-posta" : "SMS"}</span>
                <span>Kod: {template.code}</span>
              </div>

              {/* Subject (Email only) */}
              {template.channel === "email" && data?.subject && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                    Konu
                  </h4>
                  <div className="px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-[var(--color-foreground)]">
                    {data.subject}
                  </div>
                </div>
              )}

              {/* Body */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                  İçerik
                </h4>
                {template.channel === "email" ? (
                  <div
                    className="p-4 bg-white rounded-md border border-[var(--color-border)]"
                    dangerouslySetInnerHTML={{ __html: data?.body || "" }}
                  />
                ) : (
                  <div className="px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-[var(--color-foreground)] whitespace-pre-wrap">
                    {data?.body}
                  </div>
                )}
              </div>

              {/* Sample Data Info */}
              <div className="p-3 text-sm text-[var(--color-muted)] bg-[var(--color-surface-elevated)] rounded-md">
                <p className="font-medium mb-1">Örnek Veriler:</p>
                <p>
                  Bu önizleme örnek verilerle oluşturulmuştur. Gerçek gönderimde
                  müşteri ve fatura/kontrat verileri kullanılacaktır.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] space-y-3">
          {template.channel === "email" && (
            <form
              onSubmit={handleSendTestEmail}
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full md:max-w-sm px-3 py-2 text-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md text-[var(--color-foreground)]"
              />
              <button
                type="submit"
                disabled={sendTestEmailMutation.isPending || recipientEmail.trim().length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
              >
                {sendTestEmailMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Test Mail Gönder
              </button>
            </form>
          )}

          {sendTestEmailMutation.isSuccess && (
            <div className="p-3 text-sm text-[var(--color-success-foreground)] bg-[var(--color-success)]/10 rounded-md">
              Test maili başarıyla gönderildi.
            </div>
          )}

          {sendTestEmailMutation.isError && (
            <div className="p-3 text-sm text-[var(--color-error-foreground)] bg-[var(--color-error)]/10 rounded-md">
              Hata: {sendTestEmailMutation.error.message}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
