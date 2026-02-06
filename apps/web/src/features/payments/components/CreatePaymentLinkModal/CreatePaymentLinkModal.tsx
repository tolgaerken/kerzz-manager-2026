import { useState, useCallback, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { PAYMENTS_CONSTANTS } from "../../constants/payments.constants";
import type { CreatePaymentLinkInput } from "../../types/payment.types";

interface CreatePaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentLinkInput) => void;
  createdUrl?: string | null;
  isLoading?: boolean;
}

const initialForm: CreatePaymentLinkInput = {
  amount: 0,
  email: "",
  gsm: "",
  name: "",
  customerName: "",
  customerId: "",
  companyId: "cloud",
  installment: 1,
  cardType: "",
  canRecurring: false,
  non3d: false
};

export function CreatePaymentLinkModal({
  isOpen,
  onClose,
  onSubmit,
  createdUrl = null,
  isLoading = false
}: CreatePaymentLinkModalProps) {
  const [formData, setFormData] = useState<CreatePaymentLinkInput>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !createdUrl) {
      setFormData(initialForm);
      setErrors({});
    }
  }, [isOpen, createdUrl]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      if (errors[name]) setErrors((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || formData.amount < 1) {
      newErrors.amount = "Tutar 1 TL ve üzeri olmalıdır";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "E-posta zorunludur";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }
    if (!formData.name?.trim()) {
      newErrors.name = "Ad Soyad zorunludur";
    }
    if (!formData.customerName?.trim()) {
      newErrors.customerName = "Firma adı zorunludur";
    }
    if (!formData.companyId?.trim()) {
      newErrors.companyId = "Şirket seçin";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      onSubmit(formData);
    },
    [formData, onSubmit, validate]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdUrl ? "Ödeme linki oluşturuldu" : "Yeni ödeme linki"}
      size="xl"
    >
      {createdUrl ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-foreground-muted)]">
            Aşağıdaki linki müşteri ile paylaşabilirsiniz.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={createdUrl}
              className="flex-1 px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => {
                if (createdUrl) navigator.clipboard.writeText(createdUrl);
              }}
              className="px-4 py-2 rounded bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90"
            >
              Kopyala
            </button>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Şirket
              </label>
              <select
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {PAYMENTS_CONSTANTS.COMPANY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Firma adı
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Müşteri firma adı"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ödeyen kişi adı"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                E-posta *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@firma.com"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                GSM
              </label>
              <input
                type="tel"
                name="gsm"
                value={formData.gsm ?? ""}
                onChange={handleChange}
                placeholder="5XX XXX XX XX"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Tutar (TL) *
              </label>
              <input
                type="number"
                name="amount"
                min={1}
                step={0.01}
                value={formData.amount || ""}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Taksit
              </label>
              <input
                type="number"
                name="installment"
                min={1}
                value={formData.installment ?? 1}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="canRecurring"
                name="canRecurring"
                checked={formData.canRecurring ?? false}
                onChange={handleChange}
                className="rounded border-[var(--color-border)]"
              />
              <label htmlFor="canRecurring" className="text-sm text-[var(--color-foreground)]">
                Otomatik ödeme talimatı verilebilsin
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)]"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Oluşturuluyor..." : "Link oluştur"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
