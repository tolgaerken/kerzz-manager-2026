import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';

export function NumberEditor<TData>({ value, onSave, onCancel }: CellEditorProps<TData>) {
  const [text, setText] = useState(value != null ? String(value) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const save = useCallback(() => {
    const num = text === '' ? 0 : Number(text);
    onSave(isNaN(num) ? value : num);
  }, [text, value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        save();
      }
    },
    [save, onCancel],
  );

  const handleBlur = useCallback(() => {
    save();
  }, [save]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      className="kz-editor kz-editor--number"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
