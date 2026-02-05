import { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "../../types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSubmit: (data: CreateCustomerInput | UpdateCustomerInput) => void;
  isLoading?: boolean;
}

export function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  onSubmit,
  isLoading = false
}: CustomerFormModalProps) {
  const isEdit = !!customer;

  const [formData, setFormData] = useState<CreateCustomerInput>({
    taxNo: "",
    name: "",
    companyName: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    enabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        taxNo: customer.taxNo,
        name: customer.name,
        companyName: customer.companyName,
        address: customer.address,
        city: customer.city,
        district: customer.district,
        phone: customer.phone,
        email: customer.email,
        enabled: customer.enabled
      });
    } else {
      setFormData({
        taxNo: "",
        name: "",
        companyName: "",
        address: "",
        city: "",
        district: "",
        phone: "",
        email: "",
        enabled: true
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.taxNo?.trim()) {
      newErrors.taxNo = "Vergi numarası zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    onSubmit(formData);
  };

  const inputClasses =
    "w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

  const labelClasses = "block text-sm font-medium text-[var(--color-foreground)] mb-1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Müşteri Düzenle" : "Yeni Müşteri"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vergi No */}
          <div>
            <label htmlFor="taxNo" className={labelClasses}>
              Vergi No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="taxNo"
              name="taxNo"
              value={formData.taxNo}
              onChange={handleChange}
              className={`${inputClasses} ${errors.taxNo ? "border-red-500" : ""}`}
              placeholder="Vergi numarası"
            />
            {errors.taxNo && (
              <p className="mt-1 text-sm text-red-500">{errors.taxNo}</p>
            )}
          </div>

          {/* Ad */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Ad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Ad"
            />
          </div>

          {/* Şirket Adı */}
          <div className="md:col-span-2">
            <label htmlFor="companyName" className={labelClasses}>
              Şirket Adı
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Şirket adı"
            />
          </div>

          {/* Şehir */}
          <div>
            <label htmlFor="city" className={labelClasses}>
              Şehir
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Şehir"
            />
          </div>

          {/* İlçe */}
          <div>
            <label htmlFor="district" className={labelClasses}>
              İlçe
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={inputClasses}
              placeholder="İlçe"
            />
          </div>

          {/* Adres */}
          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClasses}>
              Adres
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`${inputClasses} resize-none`}
              rows={2}
              placeholder="Adres"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className={labelClasses}>
              Telefon
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Telefon numarası"
            />
          </div>

          {/* E-posta */}
          <div>
            <label htmlFor="email" className={labelClasses}>
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              placeholder="E-posta adresi"
            />
          </div>

          {/* Durum */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-foreground)]">
                Aktif
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
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
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
