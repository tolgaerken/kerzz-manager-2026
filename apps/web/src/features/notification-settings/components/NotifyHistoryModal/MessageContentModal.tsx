import { X, Mail, MessageSquare } from "lucide-react";
import type { NotificationLog } from "../../types";

interface MessageContentModalProps {
  log: NotificationLog;
  onClose: () => void;
}

export function MessageContentModal({ log, onClose }: MessageContentModalProps) {
  const isEmail = log.channel === "email";
  const templateData = log.templateData;

  const hasValue = (value: unknown): boolean =>
    value !== undefined && value !== null && value !== "";

  const recordType = templateData.recordType;
  const notificationSource = templateData.notificationSource;
  const invoiceNo = templateData.invoiceNo;
  const contractNo = templateData.contractNo;
  const renewalAmount = templateData.renewalAmount;
  const oldAmount = templateData.oldAmount;
  const increaseRateInfo = templateData.increaseRateInfo;
  const paymentLink = templateData.paymentLink;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            {isEmail ? (
              <Mail className="w-4 h-4 text-[var(--color-info)]" />
            ) : (
              <MessageSquare className="w-4 h-4 text-[var(--color-success)]" />
            )}
            <h3 className="text-base font-semibold text-[var(--color-foreground)]">
              Mesaj İçeriği
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-[var(--color-surface-elevated)] text-[var(--color-muted-foreground)]">
              {isEmail ? "E-posta" : "SMS"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Recipient info */}
          <div className="flex flex-wrap gap-3 text-sm bg-[var(--color-surface-elevated)] rounded-lg p-3">
            <div>
              <span className="text-[var(--color-muted-foreground)]">Alıcı:</span>{" "}
              <span className="text-[var(--color-foreground)] font-medium">
                {log.recipientName || "—"}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-muted-foreground)]">
                {isEmail ? "E-posta:" : "Telefon:"}
              </span>{" "}
              <span className="text-[var(--color-foreground)]">
                {isEmail ? log.recipientEmail : log.recipientPhone}
              </span>
            </div>
          </div>

          {/* Subject (email only) */}
          {isEmail && log.renderedSubject && (
            <div>
              <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
                Konu
              </h4>
              <div className="px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-[var(--color-foreground)]">
                {log.renderedSubject}
              </div>
            </div>
          )}

          {/* Body */}
          <div>
            <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-1">
              İçerik
            </h4>
            {isEmail ? (
              <div
                className="p-4 bg-white rounded-md border border-[var(--color-border)] max-h-[400px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: log.renderedBody }}
              />
            ) : (
              <div className="px-3 py-2 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-md text-[var(--color-foreground)] whitespace-pre-wrap">
                {log.renderedBody}
              </div>
            )}
          </div>

          {/* Bağlamsal Bilgiler */}
          {templateData && Object.keys(templateData).length > 0 && (
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-[var(--color-foreground)]">
                Bağlamsal Bilgiler
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {hasValue(recordType) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Kayıt Tipi:</span>{" "}
                    <span className="text-[var(--color-foreground)]">
                      {recordType === "invoice" ? "Fatura" : "Kontrat"}
                    </span>
                  </div>
                )}
                {hasValue(notificationSource) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Kaynak:</span>{" "}
                    <span className="text-[var(--color-foreground)]">
                      {notificationSource === "cron" ? "Otomatik (Cron)" : "Manuel"}
                    </span>
                  </div>
                )}
                {hasValue(invoiceNo) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Fatura No:</span>{" "}
                    <span className="text-[var(--color-foreground)] font-mono">
                      {String(invoiceNo)}
                    </span>
                  </div>
                )}
                {hasValue(contractNo) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Kontrat No:</span>{" "}
                    <span className="text-[var(--color-foreground)] font-mono">
                      {String(contractNo)}
                    </span>
                  </div>
                )}
                {hasValue(renewalAmount) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Yeni Tutar:</span>{" "}
                    <span className="text-[var(--color-foreground)]">
                      {String(renewalAmount)}
                    </span>
                  </div>
                )}
                {hasValue(oldAmount) && (
                  <div>
                    <span className="text-[var(--color-muted-foreground)]">Eski Tutar:</span>{" "}
                    <span className="text-[var(--color-foreground)]">
                      {String(oldAmount)}
                    </span>
                  </div>
                )}
                {hasValue(increaseRateInfo) && (
                  <div className="col-span-2">
                    <span className="text-[var(--color-muted-foreground)]">Artış Bilgisi:</span>{" "}
                    <span className="text-[var(--color-foreground)]">
                      {String(increaseRateInfo)}
                    </span>
                  </div>
                )}
                {hasValue(paymentLink) && (
                  <div className="col-span-2">
                    <span className="text-[var(--color-muted-foreground)]">Ödeme Linki:</span>{" "}
                    <a
                      href={String(paymentLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline break-all"
                    >
                      {String(paymentLink)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
