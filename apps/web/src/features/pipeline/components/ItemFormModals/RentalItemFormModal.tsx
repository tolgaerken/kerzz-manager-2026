import { useState, useEffect, useCallback } from "react";
import { X, Cloud } from "lucide-react";
import type { PipelineRental } from "../../types/pipeline.types";
import { recalculateRentalItem, generateTempId } from "../../utils/lineItemCalculations";
import { SoftwareAutocomplete, type SoftwareOption } from "./SoftwareAutocomplete";

type RentalItem = Partial<PipelineRental>;

interface RentalItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: RentalItem) => void;
  editItem?: RentalItem | null;
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

const RENTAL_TYPE_OPTIONS = [
  { value: "", label: "Tip seçin" },
  { value: "saas", label: "SaaS" },
  { value: "rental", label: "Kiralama" },
  { value: "subscription", label: "Abonelik" },
];

export function RentalItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
}: RentalItemFormModalProps) {
  const [formData, setFormData] = useState<RentalItem>({});

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({ ...editItem });
      } else {
        setFormData({
          _id: generateTempId(),
          name: "",
          description: "",
          type: "",
          qty: 1,
          unit: "adet",
          price: 0,
          currency: "tl",
          vatRate: 20,
          yearly: false,
          rentPeriod: 12,
          invoicePeriod: 12,
          discountRate: 0,
        });
      }
    }
  }, [isOpen, editItem]);

  const handleChange = useCallback(
    (field: keyof RentalItem, value: string | number | boolean) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        // Kira süresi 12 ay ve üzeri ise yıllık olarak işaretle
        if (field === "rentPeriod") {
          updated.yearly = (Number(value) || 0) >= 12;
        }
        if (["qty", "price", "vatRate", "discountRate", "rentPeriod", "invoicePeriod"].includes(field as string)) {
          return recalculateRentalItem(updated as PipelineRental) as RentalItem;
        }
        return updated;
      });
    },
    []
  );

  const handleRentalSelect = useCallback(
    (product: SoftwareOption | null) => {
      if (!product) {
        setFormData((prev) => ({
          ...prev,
          productId: "",
          catalogId: "",
          name: "",
          type: "",
          price: 0,
          vatRate: 20,
          currency: "tl",
          unit: "adet",
        }));
        return;
      }
      setFormData((prev) => {
        const updated = {
          ...prev,
          productId: product.id,
          catalogId: product._id,
          name: product.nameWithCode || product.friendlyName || product.name,
          type: product.type || "saas",
          price: product.salePrice || 0,
          vatRate: product.vatRate || 20,
          currency: product.currency || "tl",
          unit: product.unit || "adet",
        };
        return recalculateRentalItem(updated as PipelineRental) as RentalItem;
      });
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const calculated = recalculateRentalItem(formData as PipelineRental);
    onSubmit(calculated as RentalItem);
    onClose();
  }, [formData, onSubmit, onClose]);

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
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      />

      {/* Modal */}
      <div 
        className="relative z-10 w-full md:max-w-md bg-[var(--color-surface)] rounded-t-2xl md:rounded-xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[var(--color-warning)]/10 p-1.5">
              <Cloud className="h-4 w-4 text-[var(--color-warning)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              {isEditMode ? "Kiralama Düzenle" : "Yeni Kiralama"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Form - div kullanıyoruz çünkü parent modal zaten form içerebilir */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Kiralama Seçimi (Autocomplete) */}
            <SoftwareAutocomplete
              value={formData.productId || formData.catalogId}
              displayName={formData.name}
              onChange={handleRentalSelect}
              productType="rental"
            />

            {/* Kiralama Adı (Manuel düzenleme için) */}
            <div>
              <label className={labelClassName}>
                Kiralama Adı <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Kiralama adı girin veya yukarıdan seçin"
                className={inputClassName}
                required
              />
            </div>

            {/* Tip */}
            <div>
              <label className={labelClassName}>Kiralama Tipi</label>
              <select
                value={formData.type || ""}
                onChange={(e) => handleChange("type", e.target.value)}
                className={inputClassName}
              >
                {RENTAL_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Açıklama */}
            <div>
              <label className={labelClassName}>Açıklama</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Kiralama açıklaması"
                rows={2}
                className={`${inputClassName} resize-none`}
              />
            </div>

            {/* Miktar & Birim */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Miktar</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.qty || ""}
                  onChange={(e) =>
                    handleChange("qty", parseInt(e.target.value) || 1)
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Birim</label>
                <input
                  type="text"
                  value={formData.unit || ""}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="adet"
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Kira Süresi & Fatura Periyodu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Kira Süresi (Ay)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.rentPeriod || ""}
                  onChange={(e) =>
                    handleChange("rentPeriod", parseInt(e.target.value) || 1)
                  }
                  placeholder="12"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>Fatura Periyodu (Ay)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.invoicePeriod || ""}
                  onChange={(e) =>
                    handleChange("invoicePeriod", parseInt(e.target.value) || 1)
                  }
                  placeholder="12"
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Yıllık Badge */}
            {formData.yearly && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                <span className="text-xs font-medium text-[var(--color-success)]">
                  Yıllık kiralama olarak işaretlendi (12+ ay)
                </span>
              </div>
            )}

            {/* Fiyat & Para Birimi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Aylık Fiyat</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className={inputClassName}
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

            {/* KDV & İndirim */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>KDV %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.vatRate ?? ""}
                  onChange={(e) =>
                    handleChange("vatRate", parseFloat(e.target.value) || 0)
                  }
                  placeholder="20"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>İndirim %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountRate ?? ""}
                  onChange={(e) =>
                    handleChange("discountRate", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className={inputClassName}
                />
              </div>
            </div>

            {/* Toplam Özeti */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">Ara Toplam</span>
                <span className="text-[var(--color-foreground)]">
                  {formatCurrency(formData.subTotal, formData.currency)}
                </span>
              </div>
              {(formData.discountTotal ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted-foreground)]">İndirim</span>
                  <span className="text-[var(--color-error)]">
                    -{formatCurrency(formData.discountTotal, formData.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-muted-foreground)]">KDV</span>
                <span className="text-[var(--color-foreground)]">
                  {formatCurrency(formData.taxTotal, formData.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[var(--color-border)]">
                <span className="text-[var(--color-foreground)]">Genel Toplam</span>
                <span className="text-[var(--color-warning)]">
                  {formatCurrency(formData.grandTotal, formData.currency)}
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
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity"
            >
              {isEditMode ? "Güncelle" : "Ekle"}
            </button>
          </div>
        </div>
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
