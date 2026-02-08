import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';

function TextEditorInner<TData>({ value, onSave, onCancel, onSaveAndMoveNext }: CellEditorProps<TData>) {
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
        if (onSaveAndMoveNext) {
          onSaveAndMoveNext(text, 'enter');
        } else {
          onSave(text);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (onSaveAndMoveNext) {
          onSaveAndMoveNext(text, 'tab');
        } else {
          onSave(text);
        }
      }
    },
    [text, onSave, onCancel, onSaveAndMoveNext],
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

export const TextEditor = React.memo(TextEditorInner) as typeof TextEditorInner;
