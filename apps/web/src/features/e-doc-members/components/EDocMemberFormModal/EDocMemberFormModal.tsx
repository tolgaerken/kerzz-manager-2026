import { useState, useEffect, useCallback } from "react";
import { Modal } from "../../../../components/ui";
import { CONTRACT_TYPE_OPTIONS } from "../../constants/eDocMembers.constants";
import type {
  EDocMemberItem,
  EDocMemberFormData,
} from "../../types/eDocMember.types";
import type { CustomerLookupItem } from "../../../lookup";
import { useCompanies } from "../../../companies";
import { useLicenseLookup } from "../../../lookup";
import { CustomerAutocomplete } from "./CustomerAutocomplete";

interface EDocMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EDocMemberFormData) => void;
  editItem?: EDocMemberItem | null;
  loading?: boolean;
}

const initialFormState: EDocMemberFormData = {
  erpId: "",
  licanceId: "",
  internalFirm: "",
  active: true,
  desc: "",
  taxNumber: "",
  contractType: "pay-as-you-go",
  creditPrice: 0,
  contract: false,
};

export function EDocMemberFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  loading = false,
}: EDocMemberFormModalProps) {
  const [formData, setFormData] =
    useState<EDocMemberFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookupItem | null>(
    null,
  );

  const { data: companies = [] } = useCompanies();
  const { licenses } = useLicenseLookup();

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          erpId: editItem.erpId || "",
          licanceId: editItem.licanceId || "",
          internalFirm: editItem.internalFirm || "",
          active: editItem.active ?? true,
          desc: editItem.desc || "",
          taxNumber: editItem.taxNumber || "",
          contractType: editItem.contractType || "pay-as-you-go",
          creditPrice: editItem.creditPrice || 0,
          contract: editItem.contract ?? false,
        });
        if (editItem.erpId) {
          setSelectedCustomer({
            _id: "",
            id: "",
            erpId: editItem.erpId,
            name: editItem.customerName || "",
            companyName: editItem.customerName || "",
            taxNo: editItem.taxNumber || "",
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

  const handleCustomerChange = useCallback((customer: CustomerLookupItem | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        erpId: customer.erpId || "",
        taxNumber: customer.taxNo || prev.taxNumber,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.customer;
        return next;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        erpId: "",
      }));
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomer && !formData.erpId) {
      newErrors.customer = "Müşteri seçimi zorunludur";
    }
    if (!formData.internalFirm) {
      newErrors.internalFirm = "Firma seçilmelidir";
    }
    if (!formData.contractType) {
      newErrors.contractType = "Üyelik tipi seçilmelidir";
    }
    if (!formData.desc) {
      newErrors.desc = "Açıklama zorunludur";
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
    field: keyof EDocMemberFormData,
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
          ? "E-Belge Üyesi Düzenle"
          : "Yeni E-Belge Üyesi"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Müşteri Seçimi */}
        <CustomerAutocomplete
          value={selectedCustomer}
          onChange={handleCustomerChange}
          error={errors.customer}
          disabled={loading}
        />

        {/* Seçili müşteri detayları */}
        {selectedCustomer && formData.erpId && (
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
                Vergi No
              </label>
              <div className="px-3 py-2 text-sm font-mono bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)]">
                {formData.taxNumber || "-"}
              </div>
            </div>
          </div>
        )}

        {/* Firma ve Üyelik Tipi */}
        <div className="grid grid-cols-2 gap-4">
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
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.internalFirm}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Üyelik Tipi
            </label>
            <select
              value={formData.contractType}
              onChange={(e) => handleChange("contractType", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {CONTRACT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            {errors.contractType && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.contractType}
              </p>
            )}
          </div>
        </div>

        {/* Lisans Seçimi */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Lisans
          </label>
          <select
            value={formData.licanceId}
            onChange={(e) => handleChange("licanceId", e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
          >
            <option value="">Lisans seçin (opsiyonel)</option>
            {licenses.map((license) => (
              <option key={license._id} value={license._id}>
                {license.brandName || license._id}
              </option>
            ))}
          </select>
        </div>

        {/* Açıklama ve Vergi No */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Açıklama
            </label>
            <input
              type="text"
              value={formData.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              placeholder="Açıklama girin"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.desc && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.desc}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Vergi Numarası
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="Vergi numarası"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
          </div>
        </div>

        {/* Kontör Fiyatı */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Kontör Fiyatı
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.creditPrice || ""}
              onChange={(e) =>
                handleChange("creditPrice", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
          </div>
          <div className="flex items-end gap-4 col-span-2">
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-foreground)]">
                Aktif
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input
                type="checkbox"
                checked={formData.contract}
                onChange={(e) => handleChange("contract", e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-foreground)]">
                Kontrat
              </span>
            </label>
          </div>
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
            className="px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
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
