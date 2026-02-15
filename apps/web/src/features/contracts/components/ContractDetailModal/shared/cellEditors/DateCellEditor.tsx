import { useState, useRef, useEffect, useCallback } from "react";
import type { CellEditorProps } from "@kerzz/grid";

/**
 * Kerzz-grid compatible date editor.
 * Renders a native HTML date input for picking a date.
 */
export function DateCellEditor<TData>({
  value,
  onSave,
  onCancel
}: CellEditorProps<TData>) {
  const toDateString = (val: unknown): string => {
    if (!val) return "";
    try {
      const d = new Date(val as string);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [dateValue, setDateValue] = useState<string>(toDateString(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = useCallback(() => {
    if (dateValue) {
      onSave(new Date(dateValue + "T00:00:00").toISOString());
    } else {
      onSave(null);
    }
  }, [dateValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Tab") {
        handleSave();
      }
    },
    [handleSave, onCancel]
  );

  return (
    <div className="kz-editor kz-editor--date">
      <input
        ref={inputRef}
        type="date"
        value={dateValue}
        onChange={(e) => setDateValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="kz-editor__date-input"
        style={{
          width: "100%",
          height: "100%",
          padding: "2px 6px",
          border: "1px solid var(--color-primary, #3b82f6)",
          borderRadius: "4px",
          fontSize: "13px",
          outline: "none",
          backgroundColor: "var(--color-surface, #fff)"
        }}
      />
    </div>
  );
}
