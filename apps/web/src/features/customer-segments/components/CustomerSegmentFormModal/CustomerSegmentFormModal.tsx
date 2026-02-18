import { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui";
import type {
  CustomerSegment,
  CreateCustomerSegmentInput,
  UpdateCustomerSegmentInput
} from "../../types";

interface CustomerSegmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment?: CustomerSegment | null;
  onSubmit: (
    data: CreateCustomerSegmentInput | UpdateCustomerSegmentInput
  ) => void;
  isLoading?: boolean;
}

export function CustomerSegmentFormModal({
  isOpen,
  onClose,
  segment,
  onSubmit,
  isLoading = false
}: CustomerSegmentFormModalProps) {
  const isEdit = !!segment;

  const [formData, setFormData] = useState<CreateCustomerSegmentInput>({
    name: "",
    description: "",
    invoiceOverdueNotification: true,
    newInvoiceNotification: true,
    lastPaymentNotification: true,
    balanceNotification: true,
    annualContractExpiryNotification: true,
    monthlyContractExpiryNotification: true,
    canBlockCashRegister: false,
    canBlockLicense: false,
    enabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (segment) {
      setFormData({
        name: segment.name,
        description: segment.description,
        invoiceOverdueNotification: segment.invoiceOverdueNotification,
        newInvoiceNotification: segment.newInvoiceNotification,
        lastPaymentNotification: segment.lastPaymentNotification,
        balanceNotification: segment.balanceNotification,
        annualContractExpiryNotification:
          segment.annualContractExpiryNotification,
        monthlyContractExpiryNotification:
          segment.monthlyContractExpiryNotification,
        canBlockCashRegister: segment.canBlockCashRegister,
        canBlockLicense: segment.canBlockLicense,
        enabled: segment.enabled
      });
    } else {
      setFormData({
        name: "",
        description: "",
        invoiceOverdueNotification: true,
        newInvoiceNotification: true,
        lastPaymentNotification: true,
        balanceNotification: true,
        annualContractExpiryNotification: true,
        monthlyContractExpiryNotification: true,
        canBlockCashRegister: false,
        canBlockLicense: false,
        enabled: true
      });
    }
    setErrors({});
  }, [segment, isOpen]);

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

    if (!formData.name?.trim()) {
      newErrors.name = "Segment adı zorunludur";
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

  const labelClasses =
    "block text-sm font-medium text-[var(--color-foreground)] mb-1";

  const checkboxLabelClasses =
    "flex items-center gap-2 cursor-pointer text-sm text-[var(--color-foreground)]";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Segment Düzenle" : "Yeni Segment"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClasses}>
              Segment Adı <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${inputClasses} ${errors.name ? "border-[var(--color-error)]" : ""}`}
              placeholder="Segment adı"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className={labelClasses}>
              Açıklama
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={inputClasses}
              placeholder="Segment açıklaması"
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <h3 className="text-sm font-medium text-[var(--color-foreground)] mb-3">
            Bildirim Ayarları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="invoiceOverdueNotification"
                checked={formData.invoiceOverdueNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Fatura gecikme bildirimi
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="newInvoiceNotification"
                checked={formData.newInvoiceNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Yeni kesilen fatura bildirimi
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="lastPaymentNotification"
                checked={formData.lastPaymentNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Son ödeme bildirimi
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="balanceNotification"
                checked={formData.balanceNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Cari bakiye bildirimi
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="annualContractExpiryNotification"
                checked={formData.annualContractExpiryNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Yıllık kontrat bitiş uyarısı
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="monthlyContractExpiryNotification"
                checked={formData.monthlyContractExpiryNotification}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              Aylık kontrat bitiş uyarısı
            </label>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <h3 className="text-sm font-medium text-[var(--color-foreground)] mb-3">
            Bloklama Ayarları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="canBlockCashRegister"
                checked={formData.canBlockCashRegister}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-warning)] focus:ring-[var(--color-warning)]"
              />
              Otomatik yazar kasa bloklanabilir
            </label>

            <label className={checkboxLabelClasses}>
              <input
                type="checkbox"
                name="canBlockLicense"
                checked={formData.canBlockLicense}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-warning)] focus:ring-[var(--color-warning)]"
              />
              Otomatik lisans bloklanabilir
            </label>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Aktif
          </label>
        </div>

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
