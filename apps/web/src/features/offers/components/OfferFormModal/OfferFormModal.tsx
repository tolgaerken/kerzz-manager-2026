import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { Offer, CreateOfferInput } from "../../types/offer.types";
import { useOffer } from "../../hooks/useOffers";
import { CustomerAutocomplete } from "./CustomerAutocomplete";
import { useCompanies } from "../../../companies/hooks/useCompanies";
import {
  ProductItemsTable,
  LicenseItemsTable,
  RentalItemsTable,
  PaymentItemsTable,
} from "../../../pipeline";

type TabId = "general" | "products" | "licenses" | "rentals" | "payments" | "notes";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "general", label: "Genel" },
  { id: "products", label: "Ürünler" },
  { id: "licenses", label: "Lisanslar" },
  { id: "rentals", label: "Kiralamalar" },
  { id: "payments", label: "Ödemeler" },
  { id: "notes", label: "Notlar" },
];

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOfferInput) => void;
  editItem?: Offer | null;
  loading?: boolean;
}

const initialFormState: CreateOfferInput = {
  customerId: "",
  customerName: "",
  sellerName: "",
  saleDate: new Date().toISOString().slice(0, 10),
  validUntil: "",
  usdRate: 0,
  eurRate: 0,
  internalFirm: "",
  offerNote: "",
  products: [],
  licenses: [],
  rentals: [],
  payments: [],
};

const inputClassName =
  "w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow";

const labelClassName =
  "block text-sm font-medium text-[var(--color-foreground)] mb-1.5";

export function OfferFormModal({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  loading = false,
}: OfferFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [formData, setFormData] = useState<CreateOfferInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Edit modunda detaylı veriyi (products, licenses vb.) çek
  const { data: offerDetail } = useOffer(editItem?._id || "");

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          customerId: editItem.customerId || "",
          customerName: editItem.customerName || "",
          sellerName: editItem.sellerName || "",
          saleDate: editItem.saleDate
            ? editItem.saleDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          validUntil: editItem.validUntil
            ? editItem.validUntil.slice(0, 10)
            : "",
          usdRate: editItem.usdRate || 0,
          eurRate: editItem.eurRate || 0,
          internalFirm: editItem.internalFirm || "",
          offerNote: editItem.offerNote || "",
          products: editItem.products || [],
          licenses: editItem.licenses || [],
          rentals: editItem.rentals || [],
          payments: editItem.payments || [],
        });
      } else {
        setFormData(initialFormState);
      }
      setActiveTab("general");
      setErrors({});
    }
  }, [isOpen, editItem]);

  // Detail verisi geldiğinde kalemleri state'e yaz (pipeline veya fallback)
  useEffect(() => {
    if (offerDetail && editItem) {
      setFormData((prev) => ({
        ...prev,
        products: offerDetail.products || [],
        licenses: offerDetail.licenses || [],
        rentals: offerDetail.rentals || [],
        payments: offerDetail.payments || [],
      }));
    }
  }, [offerDetail, editItem]);

  // Escape tuşu
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) {
      newErrors.customerId = "Müşteri seçimi zorunludur";
    }
    if (!formData.saleDate) {
      newErrors.saleDate = "Teklif tarihi zorunludur";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab("general");
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof CreateOfferInput,
    value: string | number,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Full-screen modal */}
      <div className="relative z-10 flex flex-col w-full h-full bg-[var(--color-surface)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {isEditMode ? "Teklif Düzenle" : "Yeni Teklif"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-6 shrink-0 overflow-x-auto">
          {TABS.map((tab) => {
            const countMap: Partial<Record<TabId, number>> = {
              products: formData.products?.length || 0,
              licenses: formData.licenses?.length || 0,
              rentals: formData.rentals?.length || 0,
              payments: formData.payments?.length || 0,
            };
            const count = countMap[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {tab.label}
                {count != null && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full ${
                      activeTab === tab.id
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-border)] text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Genel Tab */}
            {activeTab === "general" && (
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <GeneralTab
                  formData={formData}
                  errors={errors}
                  setFormData={setFormData}
                  setErrors={setErrors}
                  handleChange={handleChange}
                />
              </div>
            )}

            {/* Ürünler Tab */}
            {activeTab === "products" && (
              <div className="flex-1 min-h-0 px-4 py-3">
                <ProductItemsTable
                  items={formData.products || []}
                  onItemsChange={(items) =>
                    setFormData((prev) => ({ ...prev, products: items }))
                  }
                />
              </div>
            )}

            {/* Lisanslar Tab */}
            {activeTab === "licenses" && (
              <div className="flex-1 min-h-0 px-4 py-3">
                <LicenseItemsTable
                  items={formData.licenses || []}
                  onItemsChange={(items) =>
                    setFormData((prev) => ({ ...prev, licenses: items }))
                  }
                />
              </div>
            )}

            {/* Kiralamalar Tab */}
            {activeTab === "rentals" && (
              <div className="flex-1 min-h-0 px-4 py-3">
                <RentalItemsTable
                  items={formData.rentals || []}
                  onItemsChange={(items) =>
                    setFormData((prev) => ({ ...prev, rentals: items }))
                  }
                />
              </div>
            )}

            {/* Ödemeler Tab */}
            {activeTab === "payments" && (
              <div className="flex-1 min-h-0 px-4 py-3">
                <PaymentItemsTable
                  items={formData.payments || []}
                  onItemsChange={(items) =>
                    setFormData((prev) => ({ ...prev, payments: items }))
                  }
                />
              </div>
            )}

            {/* Notlar Tab */}
            {activeTab === "notes" && (
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-4xl">
                  <label className={labelClassName}>Teklif Notu</label>
                  <textarea
                    value={formData.offerNote || ""}
                    onChange={(e) => handleChange("offerNote", e.target.value)}
                    placeholder="Teklif ile ilgili notlar..."
                    rows={8}
                    className={`${inputClassName} resize-y`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] shrink-0">
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
      </div>
    </div>
  );
}

// --- Genel Tab bileşeni (SRP için ayrıldı) ---

interface GeneralTabProps {
  formData: CreateOfferInput;
  errors: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<CreateOfferInput>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleChange: (field: keyof CreateOfferInput, value: string | number) => void;
}

function GeneralTab({
  formData,
  errors,
  setFormData,
  setErrors,
  handleChange,
}: GeneralTabProps) {
  const { data: companies } = useCompanies();

  return (
    <div className="max-w-4xl space-y-5">
      {/* Müşteri Seçimi */}
      <CustomerAutocomplete
        value={formData.customerId}
        displayName={formData.customerName || ""}
        onChange={(customerId, customerName) => {
          setFormData((prev) => ({ ...prev, customerId, customerName }));
          if (errors.customerId) {
            setErrors((prev) => {
              const next = { ...prev };
              delete next.customerId;
              return next;
            });
          }
        }}
        error={errors.customerId}
      />

      {/* Satıcı */}
      <div>
        <label className={labelClassName}>Satıcı Adı</label>
        <input
          type="text"
          value={formData.sellerName || ""}
          onChange={(e) => handleChange("sellerName", e.target.value)}
          placeholder="Satıcı adı"
          className={inputClassName}
        />
      </div>

      {/* Tarihler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>Teklif Tarihi</label>
          <input
            type="date"
            value={formData.saleDate || ""}
            onChange={(e) => handleChange("saleDate", e.target.value)}
            className={inputClassName}
          />
          {errors.saleDate && (
            <p className="mt-1 text-xs text-[var(--color-error)]">
              {errors.saleDate}
            </p>
          )}
        </div>
        <div>
          <label className={labelClassName}>Geçerlilik Tarihi</label>
          <input
            type="date"
            value={formData.validUntil || ""}
            onChange={(e) => handleChange("validUntil", e.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {/* Kurlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>USD Kuru</label>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={formData.usdRate || ""}
            onChange={(e) =>
              handleChange("usdRate", parseFloat(e.target.value) || 0)
            }
            placeholder="0.0000"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>EUR Kuru</label>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={formData.eurRate || ""}
            onChange={(e) =>
              handleChange("eurRate", parseFloat(e.target.value) || 0)
            }
            placeholder="0.0000"
            className={inputClassName}
          />
        </div>
      </div>

      {/* Firmamız */}
      <div>
        <label className={labelClassName}>Firmamız</label>
        <select
          value={formData.internalFirm || ""}
          onChange={(e) => handleChange("internalFirm", e.target.value)}
          className={inputClassName}
        >
          <option value="">Firma seçiniz...</option>
          {companies?.map((company) => (
            <option key={company._id} value={company.name}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Notlar */}
      <div>
        <label className={labelClassName}>Notlar</label>
        <textarea
          value={formData.offerNote || ""}
          onChange={(e) => handleChange("offerNote", e.target.value)}
          placeholder="Teklif ile ilgili notlar..."
          rows={3}
          className={`${inputClassName} resize-none`}
        />
      </div>
    </div>
  );
}
