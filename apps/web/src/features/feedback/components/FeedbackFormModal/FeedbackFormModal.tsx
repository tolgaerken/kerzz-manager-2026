import { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/Modal";
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
  CreateFeedbackInput,
  UpdateFeedbackInput,
} from "../../types/feedback.types";
import { STATUS_LABELS, PRIORITY_LABELS } from "../../types/feedback.types";

// Form data tipi - hem create hem update için ortak
interface FeedbackFormData {
  title: string;
  description: string;
  priority: FeedbackPriority;
  status?: FeedbackStatus;
}

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback?: Feedback;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  isLoading?: boolean;
}

const PRIORITY_OPTIONS: FeedbackPriority[] = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS: FeedbackStatus[] = [
  "open",
  "in_progress",
  "completed",
  "rejected",
];

export function FeedbackFormModal({
  isOpen,
  onClose,
  feedback,
  onSubmit,
  isLoading,
}: FeedbackFormModalProps) {
  const isEditMode = !!feedback;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<FeedbackPriority>("medium");
  const [status, setStatus] = useState<FeedbackStatus>("open");

  useEffect(() => {
    if (feedback) {
      setTitle(feedback.title || "");
      setDescription(feedback.description || "");
      setPriority(feedback.priority || "medium");
      setStatus(feedback.status || "open");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("open");
    }
  }, [feedback, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    const formData: FeedbackFormData = {
      title: title.trim(),
      description: description.trim(),
      priority,
    };

    if (isEditMode) {
      formData.status = status;
    }

    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Geribildirim Düzenle" : "Yeni Geribildirim"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Başlık */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[var(--color-foreground)] mb-1"
          >
            Başlık <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Geribildirim başlığı"
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            required
          />
        </div>

        {/* Açıklama */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-[var(--color-foreground)] mb-1"
          >
            Açıklama <span className="text-[var(--color-error)]">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detaylı açıklama"
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Öncelik */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-[var(--color-foreground)] mb-1"
          >
            Öncelik
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {PRIORITY_LABELS[opt]}
              </option>
            ))}
          </select>
        </div>

        {/* Durum - Sadece düzenleme modunda */}
        {isEditMode && (
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-[var(--color-foreground)] mb-1"
            >
              Durum
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {STATUS_LABELS[opt]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !description.trim()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
