import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';

export function TextEditor<TData>({ value, onSave, onCancel }: CellEditorProps<TData>) {
  const [text, setText] = useState(value != null ? String(value) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(text);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onSave(text);
      }
    },
    [text, onSave, onCancel],
  );

  const handleBlur = useCallback(() => {
    onSave(text);
  }, [text, onSave]);

  return (
    <input
      ref={inputRef}
      type="text"
      className="kz-editor kz-editor--text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    />
  );
}
