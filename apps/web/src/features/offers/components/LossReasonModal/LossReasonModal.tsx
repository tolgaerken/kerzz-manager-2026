import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../components/ui";
import type { OfferLossInfo } from "../../types/offer.types";

interface LossReasonModalProps {
  isOpen: boolean;
  initialValue?: OfferLossInfo;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (value: OfferLossInfo) => void;
}

const REASON_OPTIONS = [
  { value: "", label: "Neden seçin" },
  { value: "price", label: "Fiyat" },
  { value: "competitor", label: "Rakip" },
  { value: "timing", label: "Zamanlama" },
  { value: "no-budget", label: "Bütçe yok" },
  { value: "no-response", label: "Yanıt yok" },
  { value: "other", label: "Diğer" },
] as const;

const inputClassName =
  "w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-shadow";

const labelClassName =
  "block text-sm font-medium text-[var(--color-foreground)] mb-1.5";

export function LossReasonModal({
  isOpen,
  initialValue,
  isLoading = false,
  onClose,
  onSubmit,
}: LossReasonModalProps) {
  const [formData, setFormData] = useState<OfferLossInfo>({
    reason: "",
    competitor: "",
    notes: "",
    lostAt: "",
    lostBy: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: initialValue?.reason || "",
        competitor: initialValue?.competitor || "",
        notes: initialValue?.notes || "",
        lostAt: initialValue?.lostAt
          ? initialValue.lostAt.split("T")[0]
          : new Date().toISOString().slice(0, 10),
        lostBy: initialValue?.lostBy || "",
      });
      setErrors({});
    }
  }, [isOpen, initialValue]);

  const showCompetitor = useMemo(
    () => formData.reason === "competitor",
    [formData.reason]
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.reason) {
      nextErrors.reason = "Neden alanı zorunludur";
    }
    if (showCompetitor && !formData.competitor?.trim()) {
      nextErrors.competitor = "Rakip adı zorunludur";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      reason: formData.reason,
      competitor: formData.competitor?.trim(),
      notes: formData.notes?.trim(),
      lostAt: formData.lostAt,
      lostBy: formData.lostBy?.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kaybedilme Nedeni"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClassName}>Neden</label>
          <select
            className={inputClassName}
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="mt-1 text-xs text-[var(--color-error)]">
              {errors.reason}
            </p>
          )}
        </div>

        {showCompetitor && (
          <div>
            <label className={labelClassName}>Rakip</label>
            <input
              className={inputClassName}
              value={formData.competitor || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, competitor: e.target.value }))
              }
              placeholder="Rakip firma adı"
            />
            {errors.competitor && (
              <p className="mt-1 text-xs text-[var(--color-error)]">
                {errors.competitor}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Kaybedilme Tarihi</label>
            <input
              type="date"
              className={inputClassName}
              value={formData.lostAt || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lostAt: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClassName}>Sorumlu</label>
            <input
              className={inputClassName}
              value={formData.lostBy || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lostBy: e.target.value }))
              }
              placeholder="Kayıp sorumlusu"
            />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Not</label>
          <textarea
            className={`${inputClassName} min-h-[96px] resize-none`}
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Ek açıklama"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-60"
          >
            Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
}
