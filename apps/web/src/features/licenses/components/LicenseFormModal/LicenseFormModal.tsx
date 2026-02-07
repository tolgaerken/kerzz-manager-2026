import { useState, useEffect, useCallback } from "react";
import { X, Package, Layers, Building2, Phone, Mail, MapPin, User } from "lucide-react";
import type { License, CreateLicenseInput, UpdateLicenseInput, LicenseItem, LicenseType, CompanyType } from "../../types";
import { LICENSE_TYPES, COMPANY_TYPES, LICENSE_CATEGORIES } from "../../constants/licenses.constants";
import { LicenseModulesTab } from "../LicenseModulesTab";
import { LicenseSaasTab } from "../LicenseSaasTab";

interface LicenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  license?: License | null;
  onSubmit: (data: CreateLicenseInput | UpdateLicenseInput) => void;
  isLoading?: boolean;
}

type TabId = "info" | "modules" | "saas";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function LicenseFormModal({
  isOpen,
  onClose,
  license,
  onSubmit,
  isLoading = false
}: LicenseFormModalProps) {
  const isEdit = !!license;
  const [activeTab, setActiveTab] = useState<TabId>("info");

  const [formData, setFormData] = useState<CreateLicenseInput>({
    brandName: "",
    customerId: "",
    customerName: "",
    phone: "",
    email: "",
    type: "kerzz-pos",
    companyType: "single",
    category: "",
    active: true,
    block: false,
    blockMessage: "",
    hasRenty: false,
    hasLicense: false,
    hasBoss: false,
    address: {
      address: "",
      city: "",
      town: "",
      cityId: 0,
      townId: 0,
      country: "Türkiye",
      countryId: "TR"
    },
    licenseItems: [],
    saasItems: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (license) {
      setFormData({
        brandName: license.brandName,
        customerId: license.customerId,
        customerName: license.customerName,
        phone: license.phone,
        email: license.email,
        type: license.type,
        companyType: license.companyType,
        category: license.category,
        active: license.active,
        block: license.block,
        blockMessage: license.blockMessage,
        hasRenty: license.hasRenty,
        hasLicense: license.hasLicense,
        hasBoss: license.hasBoss,
        address: license.address,
        licenseItems: license.licenseItems || [],
        saasItems: license.saasItems || []
      });
      setActiveTab("info");
    } else {
      setFormData({
        brandName: "",
        customerId: "",
        customerName: "",
        phone: "",
        email: "",
        type: "kerzz-pos",
        companyType: "single",
        category: "",
        active: true,
        block: false,
        blockMessage: "",
        hasRenty: false,
        hasLicense: false,
        hasBoss: false,
        address: {
          address: "",
          city: "",
          town: "",
          cityId: 0,
          townId: 0,
          country: "Türkiye",
          countryId: "TR"
        },
        licenseItems: [],
        saasItems: []
      });
      setActiveTab("info");
    }
    setErrors({});
  }, [license, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    // Nested address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: newValue }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brandName?.trim()) {
      newErrors.brandName = "Tabela adı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lisans modülleri değişiklik handler'ı
  const handleLicenseItemsChange = useCallback((items: LicenseItem[]) => {
    setFormData((prev) => ({ ...prev, licenseItems: items }));
  }, []);

  // SaaS öğeleri değişiklik handler'ı
  const handleSaasItemsChange = useCallback((items: LicenseItem[]) => {
    setFormData((prev) => ({ ...prev, saasItems: items }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const tabs: Tab[] = [
    { id: "info", label: "Lisans Bilgileri", icon: <Building2 className="w-4 h-4" /> },
    {
      id: "modules",
      label: "Modüller",
      icon: <Package className="w-4 h-4" />,
      badge: formData.licenseItems?.length || 0
    },
    {
      id: "saas",
      label: "SaaS",
      icon: <Layers className="w-4 h-4" />,
      badge: formData.saasItems?.length || 0
    }
  ];

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

      {/* Modal - Fullscreen */}
      <div className="relative z-10 w-full h-full bg-[var(--color-surface)] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              {isEdit ? `Lisans Düzenle (#${license?.licenseId})` : "Yeni Lisans"}
            </h2>
            {isEdit && license && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-foreground-muted)]">
                {license.type}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-primary)] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className={`flex-1 ${activeTab === "info" ? "overflow-y-auto px-6 py-4" : "overflow-hidden px-6 py-4"}`}>
            {/* Lisans Bilgileri Tab */}
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Temel Bilgiler
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="brandName" className={labelClasses}>
                        Tabela Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="brandName"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleChange}
                        className={`${inputClasses} ${errors.brandName ? "border-red-500" : ""}`}
                        placeholder="İşletme tabela adı"
                      />
                      {errors.brandName && (
                        <p className="mt-1 text-sm text-red-500">{errors.brandName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="customerName" className={labelClasses}>
                        Müşteri Adı
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Müşteri adı"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className={labelClasses}>
                        Lisans Tipi
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={selectClasses}
                      >
                        {LICENSE_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="companyType" className={labelClasses}>
                        Şirket Tipi
                      </label>
                      <select
                        id="companyType"
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        className={selectClasses}
                      >
                        {COMPANY_TYPES.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="category" className={labelClasses}>
                        Kategori
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={selectClasses}
                      >
                        <option value="">Seçiniz</option>
                        {LICENSE_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    İletişim Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                </div>

                {/* Adres Bilgileri */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Adres Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.city" className={labelClasses}>
                        Şehir
                      </label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={formData.address?.city || ""}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Şehir"
                      />
                    </div>

                    <div>
                      <label htmlFor="address.town" className={labelClasses}>
                        İlçe
                      </label>
                      <input
                        type="text"
                        id="address.town"
                        name="address.town"
                        value={formData.address?.town || ""}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="İlçe"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address.address" className={labelClasses}>
                        Adres
                      </label>
                      <textarea
                        id="address.address"
                        name="address.address"
                        value={formData.address?.address || ""}
                        onChange={handleChange}
                        className={`${inputClasses} resize-none`}
                        rows={2}
                        placeholder="Açık adres"
                      />
                    </div>
                  </div>
                </div>

                {/* Durum Bilgileri */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Durum Bilgileri
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">Aktif</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="block"
                        checked={formData.block}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">Bloke</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasRenty"
                        checked={formData.hasRenty}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">Renty</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasLicense"
                        checked={formData.hasLicense}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">Lisans</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasBoss"
                        checked={formData.hasBoss}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-foreground)]">Boss</span>
                    </label>
                  </div>

                  {formData.block && (
                    <div className="mt-4">
                      <label htmlFor="blockMessage" className={labelClasses}>
                        Bloke Mesajı
                      </label>
                      <input
                        type="text"
                        id="blockMessage"
                        name="blockMessage"
                        value={formData.blockMessage}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Bloke nedeni"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modüller Tab */}
            {activeTab === "modules" && (
              <LicenseModulesTab
                items={formData.licenseItems || []}
                onItemsChange={handleLicenseItemsChange}
              />
            )}

            {/* SaaS Tab */}
            {activeTab === "saas" && (
              <LicenseSaasTab
                items={formData.saasItems || []}
                onItemsChange={handleSaasItemsChange}
              />
            )}
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
              {isLoading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
