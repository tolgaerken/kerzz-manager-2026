import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Modal } from "../../../../components/ui";
import type {
  Lead,
  CreateLeadInput,
  LeadPriority,
  LeadStatus,
} from "../../types/lead.types";
import { LossReasonModal } from "../LossReasonModal";
import { useLogPanelStore } from "../../../manager-log";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  onSubmit: (data: CreateLeadInput) => void;
  isLoading?: boolean;
}

const SOURCE_OPTIONS = [
  { value: "", label: "Kaynak seçin" },
  { value: "website", label: "Web Sitesi" },
  { value: "referral", label: "Referans" },
  { value: "social-media", label: "Sosyal Medya" },
  { value: "email", label: "E-posta" },
  { value: "phone", label: "Telefon" },
  { value: "event", label: "Etkinlik" },
  { value: "advertisement", label: "Reklam" },
  { value: "other", label: "Diğer" },
];

const PRIORITY_OPTIONS: { value: LeadPriority; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "urgent", label: "Acil" },
];

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "İletişime Geçildi" },
  { value: "qualified", label: "Nitelikli" },
  { value: "unqualified", label: "Niteliksiz" },
  { value: "converted", label: "Dönüştürüldü" },
  { value: "lost", label: "Kaybedildi" },
];

const CURRENCY_OPTIONS = [
  { value: "TRY", label: "TRY - Türk Lirası" },
  { value: "USD", label: "USD - Amerikan Doları" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - İngiliz Sterlini" },
];

const initialFormState: CreateLeadInput = {
  contactName: "",
  companyName: "",
  contactPhone: "",
  contactEmail: "",
  source: "",
  status: "new",
  priority: "medium",
  estimatedValue: 0,
  currency: "TRY",
  expectedCloseDate: "",
  assignedUserName: "",
  notes: "",
};

export function LeadFormModal({
  isOpen,
  onClose,
  lead,
  onSubmit,
  isLoading = false,
}: LeadFormModalProps) {
  const [formData, setFormData] = useState<CreateLeadInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const { openPipelinePanel } = useLogPanelStore();

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        setFormData({
          contactName: lead.contactName || "",
          companyName: lead.companyName || "",
          contactPhone: lead.contactPhone || "",
          contactEmail: lead.contactEmail || "",
          source: lead.source || "",
          status: lead.status || "new",
          priority: lead.priority || "medium",
          estimatedValue: lead.estimatedValue || 0,
          currency: lead.currency || "TRY",
          expectedCloseDate: lead.expectedCloseDate
            ? lead.expectedCloseDate.split("T")[0]
            : "",
          assignedUserName: lead.assignedUserName || "",
          notes: lead.notes || "",
          lossInfo: lead.lossInfo,
        });
      } else {
        setFormData({ ...initialFormState });
      }
      setErrors({});
      setIsLossModalOpen(false);
      setPendingSubmit(false);
    }
  }, [isOpen, lead]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contactName?.trim() && !formData.companyName?.trim()) {
      newErrors.contactName = "İletişim adı veya firma adı zorunludur";
      newErrors.companyName = "İletişim adı veya firma adı zorunludur";
    }

    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Geçerli bir e-posta adresi girin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (formData.status === "lost" && !formData.lossInfo?.reason) {
      setIsLossModalOpen(true);
      setPendingSubmit(true);
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof CreateLeadInput,
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

  const isEditMode = !!lead;

  const handleOpenLogs = () => {
    if (!lead) return;
    openPipelinePanel({
      pipelineRef: lead.pipelineRef,
      customerId: lead.customerId,
      leadId: lead._id,
      title: `Lead: ${lead.contactName || lead.companyName || lead.pipelineRef}`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Lead Düzenle" : "Yeni Lead"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* İletişim Adı & Firma Adı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              İletişim Adı{" "}
              <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.contactName || ""}
              onChange={(e) => handleChange("contactName", e.target.value)}
              placeholder="Ad soyad"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.contactName && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.contactName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Firma Adı{" "}
              <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Firma adı"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Telefon & E-posta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.contactPhone || ""}
              onChange={(e) => handleChange("contactPhone", e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              E-posta
            </label>
            <input
              type="email"
              value={formData.contactEmail || ""}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              placeholder="ornek@firma.com"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.contactEmail}
              </p>
            )}
          </div>
        </div>

        {/* Durum */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Durum
            </label>
            <select
              value={formData.status || "new"}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kaynak & Öncelik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Kaynak
            </label>
            <select
              value={formData.source || ""}
              onChange={(e) => handleChange("source", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Öncelik
            </label>
            <select
              value={formData.priority || "medium"}
              onChange={(e) =>
                handleChange("priority", e.target.value)
              }
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tahmini Değer, Para Birimi & Beklenen Kapanış */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Tahmini Değer
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.estimatedValue || ""}
              onChange={(e) =>
                handleChange(
                  "estimatedValue",
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Para Birimi
            </label>
            <select
              value={formData.currency || "TRY"}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
              Beklenen Kapanış
            </label>
            <input
              type="date"
              value={formData.expectedCloseDate || ""}
              onChange={(e) =>
                handleChange("expectedCloseDate", e.target.value)
              }
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
            />
          </div>
        </div>

        {/* Atanan Kişi */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Atanan Kişi
          </label>
          <input
            type="text"
            value={formData.assignedUserName || ""}
            onChange={(e) =>
              handleChange("assignedUserName", e.target.value)
            }
            placeholder="Sorumlu kişi adı"
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow"
          />
        </div>

        {/* Notlar */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">
            Notlar
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Lead hakkında notlar..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 md:pt-2 border-t border-[var(--color-border)]">
          {/* Sol taraf - Loglar butonu (sadece edit modunda) */}
          <div className="hidden md:block">
            {isEditMode && lead?.pipelineRef && (
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
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 order-2 md:order-1"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 order-1 md:order-2"
            >
              {isLoading && (
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
          {isEditMode && lead?.pipelineRef && (
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
        isLoading={isLoading}
      />
    </Modal>
  );
}
