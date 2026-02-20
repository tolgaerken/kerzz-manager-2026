import { useState, useEffect } from "react";
import { X, FileText, Calendar, Building2, Settings } from "lucide-react";
import type { CreateContractInput } from "../../types";
import { useCustomers } from "../../../customers/hooks/useCustomers";
import type { Customer } from "../../../customers/types";
import { useCompanies } from "../../../companies/hooks";

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContractInput) => void;
  isLoading?: boolean;
}

const LATE_FEE_TYPES = [
  { id: "yi-ufe", name: "Yİ-ÜFE" },
  { id: "tufe", name: "TÜFE" },
  { id: "fixed", name: "Sabit" }
];

const INCRASE_PERIODS = [
  { id: "3-month", name: "3 Aylık" },
  { id: "6-month", name: "6 Aylık" },
  { id: "12-month", name: "12 Aylık" }
];

const BILLING_TYPES = [
  { id: "future", name: "Ay Başı (Peşinat)" },
  { id: "past", name: "Ay Sonu (Vadeli)" }
];

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultContractDates = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const oneYearLaterEndOfMonth = new Date(today);
  oneYearLaterEndOfMonth.setFullYear(oneYearLaterEndOfMonth.getFullYear() + 1);
  oneYearLaterEndOfMonth.setMonth(oneYearLaterEndOfMonth.getMonth() + 1, 0);

  return {
    startDate: formatDateForInput(today),
    endDate: formatDateForInput(oneYearLaterEndOfMonth)
  };
};

export function ContractFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: ContractFormModalProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const { data: customersData } = useCustomers({
    search: customerSearch,
    limit: 20
  });

  const { data: companiesData } = useCompanies();
  const defaultDates = getDefaultContractDates();

  const [formData, setFormData] = useState<CreateContractInput>({
    customerId: "",
    description: "",
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    internalFirm: "",
    yearly: false,
    maturity: 15,
    lateFeeType: "yi-ufe",
    incraseRateType: "yi-ufe",
    incrasePeriod: "3-month",
    noVat: false,
    noNotification: false,
    contractFlow: "future",
    isFree: false
  });

  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const modalDefaultDates = getDefaultContractDates();
      // Reset form when modal opens
      setFormData({
        customerId: "",
        description: "",
        startDate: modalDefaultDates.startDate,
        endDate: modalDefaultDates.endDate,
        internalFirm: "",
        yearly: false,
        maturity: 15,
        lateFeeType: "yi-ufe",
        incraseRateType: "yi-ufe",
        incrasePeriod: "3-month",
        noVat: false,
        noNotification: false,
        contractFlow: "future",
        isFree: false
      });
      setSelectedCustomerName("");
      setCustomerSearch("");
      setErrors({});
    }
  }, [isOpen, companiesData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => ({ ...prev, customerId: customer.id }));
    setSelectedCustomerName(customer.name || customer.brand);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    if (errors.customerId) {
      setErrors((prev) => ({ ...prev, customerId: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = "Müşteri seçimi zorunludur";
    }

    if (!formData.internalFirm) {
      newErrors.internalFirm = "Firma seçimi zorunludur";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Başlangıç tarihi zorunludur";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
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

  const selectClasses =
    "w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 md:inset-4 lg:inset-[10%] z-10 bg-[var(--color-surface)] md:rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-lg bg-primary/10 p-1.5 md:p-2">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <h2 className="text-base md:text-lg font-semibold text-[var(--color-foreground)]">Yeni Kontrat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
            <div className="space-y-5 md:space-y-6 max-w-3xl">
              {/* Müşteri Seçimi */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Müşteri Bilgileri
                </h3>
                <div className="relative">
                  <label htmlFor="customerId" className={labelClasses}>
                    Müşteri <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedCustomerName || customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setSelectedCustomerName("");
                        setFormData((prev) => ({ ...prev, customerId: "" }));
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className={`${inputClasses} ${errors.customerId ? "border-[var(--color-error)]" : ""}`}
                      placeholder="Müşteri ara..."
                    />
                    {showCustomerDropdown && customersData?.data && customersData.data.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {customersData.data.map((customer) => (
                          <button
                            key={customer._id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full px-4 py-2 text-left hover:bg-[var(--color-border)] transition-colors"
                          >
                            <div className="font-medium text-[var(--color-foreground)]">
                              {customer.name || customer.brand}
                            </div>
                            <div className="text-sm text-[var(--color-foreground-muted)]">
                              {customer.taxNo}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.customerId && (
                    <p className="mt-1 text-sm text-[var(--color-error)]">{errors.customerId}</p>
                  )}
                </div>
              </div>

              {/* Tarih Bilgileri */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Tarih Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className={labelClasses}>
                      Başlangıç Tarihi <span className="text-[var(--color-error)]">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`${inputClasses} ${errors.startDate ? "border-[var(--color-error)]" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className={labelClasses}>
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate || ""}
                      onChange={handleChange}
                      className={`${inputClasses} ${errors.endDate ? "border-[var(--color-error)]" : ""}`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{errors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kontrat Ayarları */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Kontrat Ayarları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="internalFirm" className={labelClasses}>
                      Firma <span className="text-[var(--color-error)]">*</span>
                    </label>
                    <select
                      id="internalFirm"
                      name="internalFirm"
                      value={formData.internalFirm}
                      onChange={handleChange}
                      className={`${selectClasses} ${errors.internalFirm ? "border-[var(--color-error)]" : ""}`}
                    >
                      <option value="">Seçiniz</option>
                      {companiesData?.map((company) => (
                        <option key={company._id} value={company.idc}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {errors.internalFirm && (
                      <p className="mt-1 text-sm text-[var(--color-error)]">{errors.internalFirm}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="maturity" className={labelClasses}>
                      Vade (Gün)
                    </label>
                    <input
                      type="number"
                      id="maturity"
                      name="maturity"
                      value={formData.maturity}
                      onChange={handleChange}
                      min={0}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="lateFeeType" className={labelClasses}>
                      Gecikme Faizi Türü
                    </label>
                    <select
                      id="lateFeeType"
                      name="lateFeeType"
                      value={formData.lateFeeType}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      {LATE_FEE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="incraseRateType" className={labelClasses}>
                      Artış Oranı Türü
                    </label>
                    <select
                      id="incraseRateType"
                      name="incraseRateType"
                      value={formData.incraseRateType}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      {LATE_FEE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="incrasePeriod" className={labelClasses}>
                      Artış Periyodu
                    </label>
                    <select
                      id="incrasePeriod"
                      name="incrasePeriod"
                      value={formData.incrasePeriod}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      {INCRASE_PERIODS.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contractFlow" className={labelClasses}>
                      Fatura Kesim Zamanlaması
                    </label>
                    <select
                      id="contractFlow"
                      name="contractFlow"
                      value={formData.contractFlow}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      {BILLING_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ödeme Türü ve Seçenekler */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
                  Ödeme ve Bildirim
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="yearly"
                      checked={formData.yearly}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-foreground)]">Yıllık Ödeme</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="noVat"
                      checked={formData.noVat}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-foreground)]">KDV Hariç</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="noNotification"
                      checked={formData.noNotification}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-foreground)]">
                      Bildirim Gönderme
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-foreground)]">
                      Ücretsiz Kontrat
                    </span>
                  </label>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label htmlFor="description" className={labelClasses}>
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClasses} resize-none`}
                  rows={3}
                  placeholder="Kontrat açıklaması..."
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
