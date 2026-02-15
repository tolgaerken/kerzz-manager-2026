import { useEffect, useMemo, useState } from "react";
import type { InflationRateFormData, InflationRateItem } from "../../types";

interface InflationRateFormModalProps {
  isOpen: boolean;
  loading: boolean;
  editItem: InflationRateItem | null;
  onClose: () => void;
  onSubmit: (data: InflationRateFormData) => void;
}

const EMPTY_FORM: InflationRateFormData = {
  country: "tr",
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  date: new Date().toISOString().split("T")[0],
  consumer: 0,
  producer: 0,
  monthlyConsumer: 0,
  monthlyProducer: 0,
};

export function InflationRateFormModal({
  isOpen,
  loading,
  editItem,
  onClose,
  onSubmit,
}: InflationRateFormModalProps) {
  const [form, setForm] = useState<InflationRateFormData>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;

    if (editItem) {
      setForm({
        country: editItem.country || "tr",
        year: editItem.year,
        month: editItem.month,
        date: editItem.date ? new Date(editItem.date).toISOString().split("T")[0] : "",
        consumer: editItem.consumer,
        producer: editItem.producer,
        monthlyConsumer: editItem.monthlyConsumer,
        monthlyProducer: editItem.monthlyProducer,
      });
      return;
    }

    setForm(EMPTY_FORM);
  }, [isOpen, editItem]);

  const average = useMemo(
    () => Number(((form.consumer + form.producer) / 2).toFixed(2)),
    [form.consumer, form.producer],
  );
  const monthlyAverage = useMemo(
    () => Number(((form.monthlyConsumer + form.monthlyProducer) / 2).toFixed(2)),
    [form.monthlyConsumer, form.monthlyProducer],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
            {editItem ? "Enflasyon Kaydını Düzenle" : "Yeni Enflasyon Kaydı"}
          </h3>
        </div>

        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Yıl</span>
              <input
                type="number"
                required
                value={form.year}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, year: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Ay</span>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={form.month}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, month: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Tarih</span>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Ülke</span>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, country: e.target.value.toLowerCase() }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Tüketici</span>
              <input
                type="number"
                step="0.01"
                required
                value={form.consumer}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, consumer: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">Üretici</span>
              <input
                type="number"
                step="0.01"
                required
                value={form.producer}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, producer: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">
                Aylık Tüketici
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={form.monthlyConsumer}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    monthlyConsumer: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-[var(--color-muted-foreground)]">
                Aylık Üretici
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={form.monthlyProducer}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    monthlyProducer: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md bg-[var(--color-surface-elevated)] p-3">
            <div className="text-sm text-[var(--color-muted-foreground)]">
              Ortalama: <span className="font-semibold text-[var(--color-foreground)]">{average}</span>
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)]">
              Aylık Ortalama:{" "}
              <span className="font-semibold text-[var(--color-foreground)]">{monthlyAverage}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
