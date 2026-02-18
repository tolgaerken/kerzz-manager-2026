import { X, Mail, Phone, User, Building2 } from "lucide-react";
import type { QueueCustomer, QueueContact } from "../../types";

interface ContactInfoModalProps {
  isOpen: boolean;
  customer: QueueCustomer | null;
  onClose: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  primary: "Ana İletişim",
  account: "Muhasebe",
  it: "Teknik",
  management: "Yönetim",
  other: "Diğer",
};

function ContactRow({ contact, index }: { contact: QueueContact; index: number }) {
  const roleLabel = ROLE_LABELS[contact.role] ?? contact.role;
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone;

  return (
    <div
      className={`py-3 ${index > 0 ? "border-t border-[var(--color-border)]" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {contact.name || "—"}
          </span>
        </div>
        {roleLabel && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {roleLabel}
          </span>
        )}
      </div>

      <div className="pl-5 space-y-1.5">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-[var(--color-info)] shrink-0" />
          {hasEmail ? (
            <a
              href={`mailto:${contact.email}`}
              className="text-sm text-[var(--color-info)] hover:underline break-all"
            >
              {contact.email}
            </a>
          ) : (
            <span className="text-sm text-[var(--color-muted-foreground)] italic">
              E-posta yok
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />
          {hasPhone ? (
            <a
              href={`tel:${contact.phone}`}
              className="text-sm text-[var(--color-success)] hover:underline"
            >
              {contact.phone}
            </a>
          ) : (
            <span className="text-sm text-[var(--color-muted-foreground)] italic">
              Telefon yok
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContactInfoModal({
  isOpen,
  customer,
  onClose,
}: ContactInfoModalProps) {
  if (!isOpen || !customer) return null;

  const contacts = customer.contacts ?? [];
  const hasContacts = contacts.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              İletişim Bilgileri
            </h2>
            {(customer.companyName || customer.name) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {customer.companyName || customer.name}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5">
          {hasContacts ? (
            <div>
              {contacts.map((contact, i) => (
                <ContactRow key={i} contact={contact} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
              İletişim bilgisi bulunamadı
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] shrink-0">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {contacts.length} kişi
          </span>
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
