import { useState, useEffect } from "react";
import { X, FileText, Calendar, Building2, Settings } from "lucide-react";
import type { Contract, CreateContractInput, UpdateContractInput } from "../../types";
import { contractToFormData } from "../../utils/contractToFormData";
import { useCustomers, useCustomer } from "../../../customers/hooks/useCustomers";
import { useCompanies } from "../../../companies/hooks";

interface ContractEditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSubmit: (data: UpdateContractInput) => void;
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

export function ContractEditFormModal({
  isOpen,
  onClose,
  contract,
  onSubmit,
  isLoading = false
}: ContractEditFormModalProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customersData } = useCustomers({
    search: customerSearch,
    limit: 20
  });
  const { data: customerData } = useCustomer(isOpen ? contract.customerId : null);
  const { data: companiesData } = useCompanies();

  const [formData, setFormData] = useState<CreateContractInput>(() =>
    contractToFormData(contract)
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(contractToFormData(contract));
      setCustomerSearch("");
      setShowCustomerDropdown(false);
      setErrors({});
    }
  }, [isOpen, contract]);

  useEffect(() => {
    if (!isOpen) return;
    if (customerData) {
      setSelectedCustomerName(customerData.name || customerData.companyName || "");
    } else if (contract.customerId) {
      setSelectedCustomerName(contract.customerId);
    }
  }, [isOpen, customerData, contract.customerId]);

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

  const handleCustomerSelect = (customer: { _id: string; name: string; companyName: string }) => {
    setFormData((prev) => ({ ...prev, customerId: customer._id }));
    setSelectedCustomerName(customer.name || customer.companyName);
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

    if (!formData.startDate) {
      newErrors.startDate = "Başlangıç tarihi zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: CreateContractInput = {
      ...formData,
      endDate: formData.noEndDate ? "" : formData.endDate
    };
    onSubmit({ id: contract.id, ...payload });
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
      <div className="fixed inset-4 md:inset-[10%] z-10 bg-[var(--color-surface)] rounded-lg shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Kontrat Düzenle</h2>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                {contract.brand} • Kontrat No: {contract.no}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6 max-w-3xl">
              {/* Müşteri Seçimi */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Müşteri Bilgileri
                </h3>
                <div className="relative">
                  <label htmlFor="customerId" className={labelClasses}>
                    Müşteri <span className="text-red-500">*</span>
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
                      className={`${inputClasses} ${errors.customerId ? "border-red-500" : ""}`}
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
                              {customer.name || customer.companyName}
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
                    <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>
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
                      Başlangıç Tarihi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`${inputClasses} ${errors.startDate ? "border-red-500" : ""}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
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
                      disabled={formData.noEndDate}
                      className={`${inputClasses} ${formData.noEndDate ? "opacity-50" : ""}`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="noEndDate"
                        checked={formData.noEndDate}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">
                        Bitiş tarihi yok (Süresiz kontrat)
                      </span>
                    </label>
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
                      Firma
                    </label>
                    <select
                      id="internalFirm"
                      name="internalFirm"
                      value={formData.internalFirm}
                      onChange={handleChange}
                      className={selectClasses}
                    >
                      <option value="">Seçiniz</option>
                      {companiesData?.map((company) => (
                        <option key={company._id} value={company.idc}>
                          {company.name}
                        </option>
                      ))}
                    </select>
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
                </div>
              </div>

              {/* Ödeme Türü ve Seçenekler */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
                  Ödeme ve Bildirim
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
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
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
