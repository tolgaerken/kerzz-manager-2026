import { useState } from "react";
import { Send, ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import type { FeedbackPriority } from "../../types/feedback.types";
import { createScreenshotDataUrl } from "../../utils/screenshot.utils";

interface ReplyFormProps {
  onSubmit: (data: {
    description: string;
    screenshots?: string[];
    priority?: FeedbackPriority;
  }) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
}

export function ReplyForm({
  onSubmit,
  isLoading,
  placeholder = "Yanıtınızı yazın...",
}: ReplyFormProps) {
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);

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

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      return;
    }

    await onSubmit({
      description: trimmedDescription,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });

    setDescription("");
    setScreenshots([]);
  };

  const canSubmit =
    description.trim().length > 0 && !isLoading && !isProcessingScreenshot;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Screenshots Preview */}
      {screenshots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {screenshots.map((screenshot, index) => (
            <div
              key={`${screenshot.slice(0, 24)}-${index}`}
              className="relative h-16 w-16 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
            >
              <img
                src={screenshot}
                alt={`Ekran görüntüsü ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveScreenshot(index)}
                className="absolute right-0.5 top-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                aria-label={`Ekran görüntüsü ${index + 1} kaldır`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <label className="cursor-pointer rounded-md p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]">
            <ImagePlus className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScreenshotChange}
              disabled={isProcessingScreenshot || screenshots.length >= 3}
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-[var(--color-primary)] p-2 text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
