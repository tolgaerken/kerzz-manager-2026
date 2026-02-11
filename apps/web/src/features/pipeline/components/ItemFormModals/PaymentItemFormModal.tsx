import { useState, useEffect, useCallback } from "react";
import { X, CreditCard } from "lucide-react";
import type { PipelinePayment } from "../../types/pipeline.types";
import { generateTempId } from "../../utils/lineItemCalculations";

type PaymentItem = Partial<PipelinePayment>;

interface PaymentItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: PaymentItem) => void;
  editItem?: PaymentItem | null;
}

const inputClassName =
  "w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow";

const labelClassName =
  "block text-sm font-medium text-[var(--color-foreground)] mb-1.5";

const CURRENCY_OPTIONS = [
  { value: "tl", label: "TRY" },
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "bank-transfer", label: "Havale/EFT" },
  { value: "credit-card", label: "Kredi Kartı" },
  { value: "cash", label: "Nakit" },
  { value: "check", label: "Çek" },
  { value: "other", label: "Diğer" },
];

export function PaymentItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}: PaymentItemFormModalProps) {
  const [formData, setFormData] = useState<PaymentItem>({});

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({ ...editItem });
      } else {
        setFormData({
          _id: generateTempId(),
          amount: 0,
          currency: "tl",
          paymentDate: new Date().toISOString().split("T")[0],
          method: "bank-transfer",
          description: "",
          isPaid: false,
          invoiceNo: "",
        });
      }
    }
  }, [isOpen, editItem]);

  const handleChange = useCallback(
    (field: keyof PaymentItem, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
    },
    [formData, onSubmit, onClose]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const isEditMode = !!editItem;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full md:max-w-md bg-[var(--color-surface)] rounded-t-2xl md:rounded-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-1.5 ${
              formData.isPaid 
                ? "bg-[var(--color-success)]/10" 
                : "bg-[var(--color-warning)]/10"
            }`}>
              <CreditCard className={`h-4 w-4 ${
                formData.isPaid 
                  ? "text-[var(--color-success)]" 
                  : "text-[var(--color-warning)]"
              }`} />
            </div>
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              {isEditMode ? "Ödeme Düzenle" : "Yeni Ödeme"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Tutar & Para Birimi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>
                  Tutar <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    handleChange("amount", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>Para Birimi</label>
                <select
                  value={formData.currency || "tl"}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className={inputClassName}
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ödeme Tarihi & Yöntemi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Ödeme Tarihi</label>
                <input
                  type="date"
                  value={formData.paymentDate || ""}
                  onChange={(e) => handleChange("paymentDate", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Ödeme Yöntemi</label>
                <select
                  value={formData.method || "bank-transfer"}
                  onChange={(e) => handleChange("method", e.target.value)}
                  className={inputClassName}
                >
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fatura No */}
            <div>
              <label className={labelClassName}>Fatura No</label>
              <input
                type="text"
                value={formData.invoiceNo || ""}
                onChange={(e) => handleChange("invoiceNo", e.target.value)}
                placeholder="Fatura numarası"
                className={inputClassName}
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className={labelClassName}>Açıklama</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Ödeme açıklaması"
                rows={2}
                className={`${inputClassName} resize-none`}
              />
            </div>

            {/* Ödendi Durumu */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPaid || false}
                  onChange={(e) => handleChange("isPaid", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-success)]"></div>
              </label>
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--color-foreground)]">
                  {formData.isPaid ? "Ödendi" : "Beklemede"}
                </span>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {formData.isPaid 
                    ? "Bu ödeme tamamlandı olarak işaretlendi" 
                    : "Bu ödeme henüz yapılmadı"}
                </p>
              </div>
            </div>

            {/* Tutar Özeti */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-muted-foreground)]">Ödeme Tutarı</span>
                <span className={`text-lg font-semibold ${
                  formData.isPaid 
                    ? "text-[var(--color-success)]" 
                    : "text-[var(--color-foreground)]"
                }`}>
                  {formatCurrency(formData.amount, formData.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-4 py-3 border-t border-[var(--color-border)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
            >
              {isEditMode ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatCurrency(value: number | undefined, currency?: string) {
  if (value === undefined || value === null) return "-";
  const curr = currency?.toUpperCase() || "TRY";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: curr === "TL" ? "TRY" : curr,
    minimumFractionDigits: 2,
  }).format(value);
}
