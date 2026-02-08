import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "../../../../components/ui";
import { CURRENCY_OPTIONS } from "../../constants/eDocCredits.constants";
import type { EDocCreditItem, EDocCreditFormData } from "../../types/eDocCredit.types";
import type { CustomerLookupItem } from "../../../lookup";
import { useCompanies } from "../../../companies";
import { CustomerAutocomplete } from "./CustomerAutocomplete";

interface EDocCreditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EDocCreditFormData) => void;
  editItem?: EDocCreditItem | null;
  loading?: boolean;
}

const initialFormState: EDocCreditFormData = {
  erpId: "",
  customerId: "",
  price: 0,
  count: 1,
  currency: "tl",
  internalFirm: "",
  date: new Date().toISOString().split("T")[0],
};

export function EDocCreditFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  loading = false,
}: EDocCreditFormModalProps) {
  const [formData, setFormData] = useState<EDocCreditFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookupItem | null>(null);

  // Firma listesini API'den çek
  const { data: companies = [] } = useCompanies();

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          erpId: editItem.erpId || "",
          customerId: editItem.customerId || "",
          price: editItem.price || 0,
          count: editItem.count || 1,
          currency: editItem.currency || "tl",
          internalFirm: editItem.internalFirm || "",
          date: editItem.date
            ? new Date(editItem.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
        // Edit modunda müşteri bilgisini göstermek için sanal customer objesi oluştur
        if (editItem.erpId || editItem.customerId) {
          setSelectedCustomer({
            _id: "",
            id: editItem.customerId || "",
            erpId: editItem.erpId || "",
            name: editItem.customerName || "",
            companyName: editItem.customerName || "",
            taxNo: "",
          });
        } else {
          setSelectedCustomer(null);
        }
      } else {
        setFormData(initialFormState);
        setSelectedCustomer(null);
      }
      setErrors({});
    }
  }, [isOpen, editItem]);

  const calculatedTotal = useMemo(
    () => formData.price * formData.count,
    [formData.price, formData.count]
  );

  const formatTotal = useMemo(() => {
    const currencyCode =
      formData.currency === "usd"
        ? "USD"
        : formData.currency === "eur"
          ? "EUR"
          : "TRY";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(calculatedTotal);
  }, [calculatedTotal, formData.currency]);

  const handleCustomerChange = useCallback(
    (customer: CustomerLookupItem | null) => {
      setSelectedCustomer(customer);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          erpId: customer.erpId || "",
          customerId: customer.id || "",
        }));
        // Müşteri hatasını temizle
        setErrors((prev) => {
          const next = { ...prev };
          delete next.customer;
          return next;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          erpId: "",
          customerId: "",
        }));
      }
    },
    []
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomer) {
      newErrors.customer = "Müşteri seçimi zorunludur";
    }
    if (formData.price <= 0) {
      newErrors.price = "Birim fiyat 0'dan büyük olmalıdır";
    }
    if (formData.count <= 0) {
      newErrors.count = "Adet 0'dan büyük olmalıdır";
    }
    if (!formData.currency) {
      newErrors.currency = "Para birimi seçilmelidir";
    }
    if (!formData.internalFirm) {
      newErrors.internalFirm = "Firma seçilmelidir";
    }
    if (!formData.date) {
      newErrors.date = "Tarih seçilmelidir";
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
    field: keyof EDocCreditFormData,
    value: string | number
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
      title={isEditMode ? "Kontör Yükleme Düzenle" : "Yeni Kontör Yükleme"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tarih */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Tarih
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date}</p>
          )}
        </div>

        {/* Müşteri Seçimi */}
        <CustomerAutocomplete
          value={selectedCustomer}
          onChange={handleCustomerChange}
          error={errors.customer}
          disabled={loading}
        />

        {/* Seçili müşteri detayları */}
        {selectedCustomer && (formData.erpId || formData.customerId) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">
                ERP ID
              </label>
              <div className="px-3 py-2 text-sm font-mono bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)]">
                {formData.erpId || "-"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-muted-foreground)] mb-1">
                Müşteri ID
              </label>
              <div className="px-3 py-2 text-sm font-mono bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] truncate">
                {formData.customerId || "-"}
              </div>
            </div>
          </div>
        )}

        {/* Firma */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Firma
          </label>
          <select
            value={formData.internalFirm}
            onChange={(e) => handleChange("internalFirm", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
          >
            <option value="">Firma seçin</option>
            {companies.map((company) => (
              <option key={company._id} value={company.idc}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.internalFirm && (
            <p className="mt-1 text-xs text-red-500">{errors.internalFirm}</p>
          )}
        </div>

        {/* Fiyat ve Adet */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Birim Fiyat
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) =>
                handleChange("price", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Adet
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.count || ""}
              onChange={(e) =>
                handleChange("count", parseInt(e.target.value) || 0)
              }
              placeholder="1"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.count && (
              <p className="mt-1 text-xs text-red-500">{errors.count}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Para Birimi
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="mt-1 text-xs text-red-500">{errors.currency}</p>
            )}
          </div>
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
            {formData.count} adet x {formData.price.toLocaleString("tr-TR")} birim fiyat
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
