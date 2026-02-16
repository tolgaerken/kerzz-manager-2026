import { useEffect, useMemo, useState } from "react";
import { hasMeaningfulHtmlContent, sanitizeHtmlContent } from "../../utils/feedbackHtml";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [visualValue, setVisualValue] = useState("");

  useEffect(() => {
    setVisualValue(value || "");
  }, [value]);

  const sanitizedPreview = useMemo(
    () => sanitizeHtmlContent(visualValue || "<p></p>"),
    [visualValue],
  );

  const insertBlock = (tag: "p" | "h3" | "ul"): void => {
    if (mode === "html") {
      const snippet =
        tag === "h3"
          ? "<h3>Alt başlık</h3>"
          : tag === "ul"
            ? "<ul><li>Madde</li></ul>"
            : "<p>Paragraf</p>";
      const nextValue = `${value}\n${snippet}`.trim();
      onChange(nextValue);
      return;
    }

    const snippet =
      tag === "h3"
        ? "<h3>Alt başlık</h3>"
        : tag === "ul"
          ? "<ul><li>Madde</li></ul>"
          : "<p>Paragraf</p>";
    const nextValue = `${visualValue}\n${snippet}`.trim();
    setVisualValue(nextValue);
    onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              mode === "visual"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)]"
            }`}
          >
            Görsel
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              mode === "html"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)]"
            }`}
          >
            HTML
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertBlock("p")}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
          >
            Paragraf
          </button>
          <button
            type="button"
            onClick={() => insertBlock("h3")}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
          >
            Başlık
          </button>
          <button
            type="button"
            onClick={() => insertBlock("ul")}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
          >
            Liste
          </button>
        </div>
      </div>

      {mode === "html" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="<p>Detay açıklama</p>"
          rows={8}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      ) : (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(event) => {
            const nextValue = event.currentTarget.innerHTML;
            setVisualValue(nextValue);
            onChange(nextValue);
          }}
          className="min-h-[180px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          dangerouslySetInnerHTML={{ __html: sanitizedPreview }}
        />
      )}

      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
        <p className="mb-2 text-xs font-medium text-[var(--color-muted-foreground)]">Önizleme</p>
        {hasMeaningfulHtmlContent(value) ? (
          <div
            className="prose prose-sm max-w-none text-[var(--color-foreground)]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(value) }}
          />
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Önizleme için açıklama girin.
          </p>
        )}
      </div>
    </div>
  );
}
