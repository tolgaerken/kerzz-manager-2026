import { useState, useEffect, useCallback } from "react";
import { X, MessageSquare } from "lucide-react";
import type { Offer, CreateOfferInput, OfferStatus } from "../../types/offer.types";
import { useOffer } from "../../hooks/useOffers";
import { CustomerAutocomplete } from "./CustomerAutocomplete";
import { LossReasonModal } from "../LossReasonModal";
import { OfferTotalsDisplay } from "./OfferTotalsDisplay";
import { useCompanies } from "../../../companies/hooks/useCompanies";
import {
  ProductItemsTable,
  LicenseItemsTable,
  RentalItemsTable,
  PaymentItemsTable,
} from "../../../pipeline";
import { useLogPanelStore } from "../../../manager-log";

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
  status: "draft",
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

const STATUS_OPTIONS: { value: OfferStatus; label: string }[] = [
  { value: "draft", label: "Taslak" },
  { value: "sent", label: "Gönderildi" },
  { value: "revised", label: "Revize Edildi" },
  { value: "waiting", label: "Cevap Bekleniyor" },
  { value: "approved", label: "Onaylandı" },
  { value: "rejected", label: "Reddedildi" },
  { value: "won", label: "Kazanıldı" },
  { value: "lost", label: "Kaybedildi" },
  { value: "converted", label: "Dönüştürüldü" },
];

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
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const { openPipelinePanel } = useLogPanelStore();

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
          status: editItem.status || "draft",
          offerNote: editItem.offerNote || "",
          products: editItem.products || [],
          licenses: editItem.licenses || [],
          rentals: editItem.rentals || [],
          payments: editItem.payments || [],
          lossInfo: editItem.lossInfo,
        });
      } else {
        setFormData(initialFormState);
      }
      setActiveTab("general");
      setErrors({});
      setIsLossModalOpen(false);
      setPendingSubmit(false);
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
    if (formData.status === "lost" && !formData.lossInfo?.reason) {
      setIsLossModalOpen(true);
      setPendingSubmit(true);
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof CreateOfferInput,
    value: string | number,
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "status" && value !== "lost") {
        next.lossInfo = undefined;
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isEditMode = !!editItem;

  const handleOpenLogs = () => {
    if (!editItem) return;
    openPipelinePanel({
      pipelineRef: editItem.pipelineRef,
      customerId: editItem.customerId,
      offerId: editItem._id,
      title: `Teklif: ${editItem.no || editItem.pipelineRef}`,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Full-screen modal */}
        <div className="relative z-10 flex flex-col w-full h-full bg-[var(--color-surface)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-base md:text-lg font-semibold text-[var(--color-foreground)]">
            {isEditMode ? "Teklif Düzenle" : "Yeni Teklif"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 md:p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-3 md:px-6 shrink-0 overflow-x-auto scrollbar-hide">
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
                className={`px-2.5 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 md:gap-1.5 ${
                  activeTab === tab.id
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {tab.label}
                {count != null && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 text-[10px] md:text-xs font-semibold rounded-full ${
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
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
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
              <div className="flex-1 min-h-0 px-2 md:px-4 py-2 md:py-3">
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
              <div className="flex-1 min-h-0 px-2 md:px-4 py-2 md:py-3">
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
              <div className="flex-1 min-h-0 px-2 md:px-4 py-2 md:py-3">
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
              <div className="flex-1 min-h-0 px-2 md:px-4 py-2 md:py-3">
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
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
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
          <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)] shrink-0">
            {/* Sol taraf - Loglar butonu (sadece edit modunda, desktop) */}
            <div className="hidden md:block">
              {isEditMode && editItem?.pipelineRef && (
                <button
                  type="button"
                  onClick={handleOpenLogs}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Loglar
                </button>
              )}
            </div>
            
            {/* Sağ taraf - İptal ve Kaydet */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 order-2 md:order-1"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 order-1 md:order-2"
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

            {/* Mobilde Loglar butonu (sadece edit modunda) */}
            {isEditMode && editItem?.pipelineRef && (
              <button
                type="button"
                onClick={handleOpenLogs}
                className="flex md:hidden items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Loglar
              </button>
            )}
          </div>
        </form>
        </div>
      </div>

      <LossReasonModal
        isOpen={isLossModalOpen}
        initialValue={formData.lossInfo}
        onClose={() => {
          setIsLossModalOpen(false);
          setPendingSubmit(false);
        }}
        onSubmit={(value) => {
          const nextData = { ...formData, lossInfo: value, status: "lost" as const };
          setFormData(nextData);
          setIsLossModalOpen(false);
          if (pendingSubmit) {
            onSubmit(nextData);
            setPendingSubmit(false);
          }
        }}
        isLoading={loading}
      />
    </>
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
    <div className="max-w-4xl space-y-4 md:space-y-5">
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

      {/* Satıcı & Durum - Mobilde tek sütun, desktop'ta iki sütun */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
        <div>
          <label className={labelClassName}>Durum</label>
          <select
            value={formData.status || "draft"}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClassName}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarihler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
      <div className="grid grid-cols-2 gap-3 md:gap-4">
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

      {/* Toplamlar */}
      <OfferTotalsDisplay formData={formData} />
    </div>
  );
}
