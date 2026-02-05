import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CURRENCIES, UNITS } from "../../constants/hardware-products.constants";
import type {
  HardwareProduct,
  CreateHardwareProductInput,
  UpdateHardwareProductInput
} from "../../types";

interface HardwareProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: HardwareProduct | null;
  onSubmit: (data: CreateHardwareProductInput | UpdateHardwareProductInput) => void;
  isLoading: boolean;
}

const initialFormData: CreateHardwareProductInput = {
  id: "",
  name: "",
  friendlyName: "",
  description: "",
  erpId: "",
  purchasePrice: 0,
  salePrice: 0,
  vatRate: 20,
  currency: "usd",
  purchaseCurrency: "usd",
  saleCurrency: "usd",
  saleActive: true,
  unit: "AD"
};

export function HardwareProductFormModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading
}: HardwareProductFormModalProps) {
  const [formData, setFormData] = useState<CreateHardwareProductInput>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        friendlyName: product.friendlyName || "",
        description: product.description || "",
        erpId: product.erpId || "",
        purchasePrice: product.purchasePrice || 0,
        salePrice: product.salePrice || 0,
        vatRate: product.vatRate || 20,
        currency: product.currency || "usd",
        purchaseCurrency: product.purchaseCurrency || "usd",
        saleCurrency: product.saleCurrency || "usd",
        saleActive: product.saleActive ?? true,
        unit: product.unit || "AD"
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id?.trim()) {
      newErrors.id = "Ürün kodu zorunludur";
    }
    if (!formData.name?.trim()) {
      newErrors.name = "Ürün adı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {isEditMode ? "Donanım Ürünü Düzenle" : "Yeni Donanım Ürünü"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ürün Kodu */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Ürün Kodu *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={isEditMode}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                placeholder="D001"
              />
              {errors.id && (
                <p className="mt-1 text-sm text-red-500">{errors.id}</p>
              )}
            </div>

            {/* ERP Kodu */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                ERP Kodu
              </label>
              <input
                type="text"
                name="erpId"
                value={formData.erpId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="D001"
              />
            </div>

            {/* Ürün Adı */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="TPLINK-8 PORT SWITCH"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Kullanıcı Dostu Ad */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Kullanıcı Dostu Ad
              </label>
              <input
                type="text"
                name="friendlyName"
                value={formData.friendlyName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Switch 8 Port 10/100/1000"
              />
            </div>

            {/* Açıklama */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Ürün açıklaması..."
              />
            </div>

            {/* Alış Fiyatı */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Alış Fiyatı
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Satış Fiyatı */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Satış Fiyatı
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Para Birimi */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Para Birimi
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KDV Oranı */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                KDV Oranı (%)
              </label>
              <input
                type="number"
                name="vatRate"
                value={formData.vatRate}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Birim */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                Birim
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Satışta */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="saleActive"
                id="saleActive"
                checked={formData.saleActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="saleActive" className="ml-2 text-sm font-medium text-[var(--color-foreground)]">
                Satışta
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
