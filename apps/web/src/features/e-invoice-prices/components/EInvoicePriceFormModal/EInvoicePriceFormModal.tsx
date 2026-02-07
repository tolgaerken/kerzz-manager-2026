import { useState, useEffect, useMemo } from "react";
import { Modal } from "../../../../components/ui";
import type {
  EInvoicePriceItem,
  EInvoicePriceFormData,
} from "../../types/eInvoicePrice.types";

interface EInvoicePriceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EInvoicePriceFormData) => void;
  editItem?: EInvoicePriceItem | null;
  loading?: boolean;
  customerErpId?: string;
}

const initialFormState: EInvoicePriceFormData = {
  name: "",
  erpId: "",
  unitPrice: 0,
  discountRate: 0,
  quantity: 0,
  isCredit: false,
  customerErpId: "",
  sequence: 0,
};

export function EInvoicePriceFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  loading = false,
  customerErpId = "",
}: EInvoicePriceFormModalProps) {
  const [formData, setFormData] =
    useState<EInvoicePriceFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          name: editItem.name || "",
          erpId: editItem.erpId || "",
          unitPrice: editItem.unitPrice || 0,
          discountRate: editItem.discountRate || 0,
          quantity: editItem.quantity || 0,
          isCredit: editItem.isCredit || false,
          customerErpId: editItem.customerErpId || customerErpId,
          sequence: editItem.sequence || 0,
        });
      } else {
        setFormData({ ...initialFormState, customerErpId });
      }
      setErrors({});
    }
  }, [isOpen, editItem, customerErpId]);

  const calculatedTotal = useMemo(() => {
    const base = formData.unitPrice * formData.quantity;
    const discount = base * (formData.discountRate / 100);
    return Math.round((base - discount) * 100) / 100;
  }, [formData.unitPrice, formData.quantity, formData.discountRate]);

  const formatTotal = useMemo(
    () =>
      new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 2,
      }).format(calculatedTotal),
    [calculatedTotal],
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ürün adı zorunludur";
    }
    if (!formData.erpId.trim()) {
      newErrors.erpId = "ERP ID zorunludur";
    }
    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = "Birim fiyat 0'dan büyük olmalıdır";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Miktar 0 veya pozitif olmalıdır";
    }
    if (formData.discountRate < 0 || formData.discountRate > 100) {
      newErrors.discountRate = "İndirim oranı 0-100 arasında olmalıdır";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof EInvoicePriceFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isEditMode = !!editItem;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? "E-Fatura Fiyat Kaydını Düzenle"
          : "Yeni E-Fatura Fiyat Kaydı"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sıra ve ERP ID */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Sıra No
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.sequence}
              onChange={(e) =>
                handleChange("sequence", parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              ERP ID <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.erpId}
              onChange={(e) => handleChange("erpId", e.target.value)}
              placeholder="ERP kodu girin"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow font-mono"
            />
            {errors.erpId && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors.erpId}</p>
            )}
          </div>
        </div>

        {/* Ürün Adı */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Ürün Adı <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ürün adını girin"
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.name}</p>
          )}
        </div>

        {/* Miktar, Birim Fiyat, İndirim */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Miktar
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.quantity || ""}
              onChange={(e) =>
                handleChange("quantity", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{errors.quantity}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Birim Fiyat <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice || ""}
              onChange={(e) =>
                handleChange(
                  "unitPrice",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.unitPrice && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.unitPrice}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              İndirim (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discountRate || ""}
              onChange={(e) =>
                handleChange(
                  "discountRate",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.discountRate && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.discountRate}
              </p>
            )}
          </div>
        </div>

        {/* Kredi Durumu */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCredit}
              onChange={(e) => handleChange("isCredit", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/40 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-primary)]" />
          </label>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            Kredi Kalemi
          </span>
        </div>

        {/* Toplam */}
        <div className="rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Hesaplanan Toplam
            </span>
            <span className="text-lg font-bold text-[var(--color-foreground)]">
              {formatTotal}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {formData.quantity} adet x{" "}
            {formData.unitPrice.toLocaleString("tr-TR")} birim fiyat
            {formData.discountRate > 0 &&
              ` - %${formData.discountRate} indirim`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
            )}
            {isEditMode ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
