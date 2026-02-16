import { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../../../../components/ui/Modal";
import type {
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
} from "../../types/feedback.types";
import { STATUS_LABELS, PRIORITY_LABELS } from "../../types/feedback.types";
import { HtmlEditor } from "./HtmlEditor";
import { createScreenshotDataUrl } from "../../utils/screenshot.utils";
import { hasMeaningfulHtmlContent, sanitizeHtmlContent } from "../../utils/feedbackHtml";

// Form data tipi - hem create hem update için ortak
interface FeedbackFormData {
  title: string;
  description: string;
  screenshots?: string[];
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

function parsePriority(value: string): FeedbackPriority {
  if (value === "low" || value === "medium" || value === "high" || value === "urgent") {
    return value;
  }
  return "medium";
}

function parseStatus(value: string): FeedbackStatus {
  if (
    value === "open" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "rejected"
  ) {
    return value;
  }
  return "open";
}

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
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);
  const [priority, setPriority] = useState<FeedbackPriority>("medium");
  const [status, setStatus] = useState<FeedbackStatus>("open");

  useEffect(() => {
    if (feedback) {
      setTitle(feedback.title || "");
      setDescription(feedback.description || "");
      setScreenshots(feedback.screenshots || []);
      setPriority(feedback.priority || "medium");
      setStatus(feedback.status || "open");
    } else {
      setTitle("");
      setDescription("");
      setScreenshots([]);
      setPriority("medium");
      setStatus("open");
    }
  }, [feedback, isOpen]);

  const handleScreenshotChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Sadece görsel dosyası eklenebilir.");
      event.target.value = "";
      return;
    }

    if (screenshots.length >= 3) {
      toast.error("En fazla 3 ekran görüntüsü ekleyebilirsiniz.");
      event.target.value = "";
      return;
    }

    try {
      setIsProcessingScreenshot(true);
      const dataUrl = await createScreenshotDataUrl(selectedFile);
      setScreenshots((prev) => [...prev, dataUrl]);
    } catch {
      toast.error("Ekran görüntüsü eklenirken hata oluştu.");
    } finally {
      setIsProcessingScreenshot(false);
      event.target.value = "";
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedDescription = sanitizeHtmlContent(description.trim());

    if (!title.trim() || !hasMeaningfulHtmlContent(sanitizedDescription)) {
      return;
    }

    const formData: FeedbackFormData = {
      title: title.trim(),
      description: sanitizedDescription,
      screenshots,
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
            Detay Açıklama (HTML) <span className="text-[var(--color-error)]">*</span>
          </label>
          <HtmlEditor value={description} onChange={setDescription} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-foreground)]">
            Ekran Görüntüsü (Opsiyonel)
          </label>
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]">
              <ImagePlus className="h-4 w-4" />
              {isProcessingScreenshot ? "İşleniyor..." : "Ekran Görüntüsü Ekle"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
                disabled={isProcessingScreenshot || screenshots.length >= 3}
              />
            </label>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Maksimum 3 görsel. Yüklenen görseller otomatik optimize edilir.
            </p>

            {screenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={`${screenshot.slice(0, 24)}-${index}`}
                    className="relative overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                  >
                    <img
                      src={screenshot}
                      alt={`Ekran görüntüsü ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(index)}
                      className="absolute right-1 top-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                      aria-label={`Ekran görüntüsü ${index + 1} kaldır`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            onChange={(e) => setPriority(parsePriority(e.target.value))}
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
              onChange={(e) => setStatus(parseStatus(e.target.value))}
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
            disabled={
              isLoading ||
              isProcessingScreenshot ||
              !title.trim() ||
              !hasMeaningfulHtmlContent(description)
            }
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Kaydediliyor..." : isEditMode ? "Güncelle" : "Oluştur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
