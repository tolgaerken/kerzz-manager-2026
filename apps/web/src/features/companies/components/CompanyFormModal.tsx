import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { GroupCompany, UpdateGroupCompanyInput } from "../types";

interface CompanyFormModalProps {
  isOpen: boolean;
  company: GroupCompany | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateGroupCompanyInput) => Promise<void>;
}

interface CompanyFormState {
  idc: string;
  name: string;
  cloudDb: string;
  licanceId: string;
  eInvoice: boolean;
  vatNo: string;
  noVat: boolean;
  exemptionReason: string;
  description: string;
  isActive: boolean;
}

function toFormState(company: GroupCompany): CompanyFormState {
  return {
    idc: company.idc,
    name: company.name,
    cloudDb: company.cloudDb,
    licanceId: company.licanceId,
    eInvoice: company.eInvoice,
    vatNo: company.vatNo,
    noVat: company.noVat,
    exemptionReason: company.exemptionReason,
    description: company.description,
    isActive: company.isActive,
  };
}

export function CompanyFormModal({
  isOpen,
  company,
  isLoading = false,
  onClose,
  onSubmit,
}: CompanyFormModalProps) {
  const [form, setForm] = useState<CompanyFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !company) {
      setForm(null);
      setError(null);
      return;
    }

    setForm(toFormState(company));
    setError(null);
  }, [company, isOpen]);

  if (!isOpen || !company || !form) {
    return null;
  }

  const inputClassName =
    "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Firma adı zorunludur.");
      return;
    }

    if (!form.idc.trim()) {
      setError("Firma kısa kodu (IDC) zorunludur.");
      return;
    }

    setError(null);
    await onSubmit(company.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-3xl rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Firma Düzenle</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">Kod: {company.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-2">
          <label className="text-sm text-[var(--color-foreground)]">
            Firma Kodu
            <input
              value={company.id}
              readOnly
              className={`${inputClassName} mt-1 cursor-not-allowed opacity-70`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)]">
            Kısa Kod (IDC)
            <input
              value={form.idc}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, idc: e.target.value } : prev))}
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)] md:col-span-2">
            Firma Adı
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)]">
            Cloud DB
            <input
              value={form.cloudDb}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, cloudDb: e.target.value } : prev))
              }
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)]">
            Lisans ID
            <input
              value={form.licanceId}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, licanceId: e.target.value } : prev))
              }
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)]">
            Vergi No
            <input
              value={form.vatNo}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, vatNo: e.target.value } : prev))}
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)]">
            İstisna Kodu
            <input
              value={form.exemptionReason}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, exemptionReason: e.target.value } : prev))
              }
              className={`${inputClassName} mt-1`}
            />
          </label>

          <label className="text-sm text-[var(--color-foreground)] md:col-span-2">
            Açıklama
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))
              }
              rows={3}
              className={`${inputClassName} mt-1 resize-none`}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
            <input
              type="checkbox"
              checked={form.eInvoice}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, eInvoice: e.target.checked } : prev))
              }
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            />
            E-Fatura
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
            <input
              type="checkbox"
              checked={form.noVat}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, noVat: e.target.checked } : prev))}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            />
            KDV Yok
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)] md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))
              }
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            />
            Aktif
          </label>
        </div>

        {error && (
          <p className="px-5 pb-2 text-sm text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-foreground)]"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-50"
          >
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
