import { useState, useEffect, useCallback } from "react";
import { Modal, PhoneInput, parsePhoneNumber, formatFullPhoneNumber } from "../../../../components/ui";
import type { PhoneInputValue } from "../../../../components/ui";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "../../types";
import { AddressSelector, EMPTY_ADDRESS } from "../../../locations";
import type { AddressData } from "../../../locations";

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
    brand: "",
    address: { ...EMPTY_ADDRESS },
    phone: "",
    email: "",
    enabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValue, setPhoneValue] = useState<PhoneInputValue>({ countryCode: "90", phoneNumber: "" });

  useEffect(() => {
    if (customer) {
      // Telefon numarasını parse et
      const parsedPhone = customer.phone
        ? parsePhoneNumber(customer.phone)
        : { countryCode: "90", phoneNumber: "" };
      setPhoneValue(parsedPhone);

      setFormData({
        taxNo: customer.taxNo,
        name: customer.name,
        brand: customer.brand,
        address: customer.address || { ...EMPTY_ADDRESS },
        phone: customer.phone,
        email: customer.email,
        enabled: customer.enabled
      });
    } else {
      setPhoneValue({ countryCode: "90", phoneNumber: "" });
      setFormData({
        taxNo: "",
        name: "",
        brand: "",
        address: { ...EMPTY_ADDRESS },
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

  // Telefon değişiklik handler'ı
  const handlePhoneChange = useCallback((value: PhoneInputValue) => {
    setPhoneValue(value);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Telefon numarasını formatla
    const fullPhone = phoneValue.phoneNumber
      ? formatFullPhoneNumber(phoneValue)
      : "";
    onSubmit({ ...formData, phone: fullPhone });
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

          {/* Şirket Adı */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Şirket Adı
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Şirket adı"
            />
          </div>

          {/* Marka */}
          <div>
            <label htmlFor="brand" className={labelClasses}>
              Marka
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Marka"
            />
          </div>
        </div>

        {/* Adres Bilgileri - AddressSelector */}
        <AddressSelector
          value={formData.address || EMPTY_ADDRESS}
          onChange={(newAddress) =>
            setFormData((prev) => ({ ...prev, address: newAddress }))
          }
          errors={errors}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Telefon */}
          <PhoneInput
            value={phoneValue}
            onChange={handlePhoneChange}
            label="Telefon"
            placeholder="5XX XXX XX XX"
          />

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
