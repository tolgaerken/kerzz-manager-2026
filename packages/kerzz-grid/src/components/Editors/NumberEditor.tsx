import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';

function NumberEditorInner<TData>({ value, onSave, onCancel, onSaveAndMoveNext }: CellEditorProps<TData>) {
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

  const saveAndMove = useCallback(
    (direction: 'tab' | 'enter') => {
      if (!onSaveAndMoveNext) {
        save();
        return;
      }
      const num = text === '' ? 0 : Number(text);
      onSaveAndMoveNext(isNaN(num) ? value : num, direction);
    },
    [text, value, onSaveAndMoveNext, save],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveAndMove('enter');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        saveAndMove('tab');
      }
    },
    [saveAndMove, onCancel],
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

export const NumberEditor = React.memo(NumberEditorInner) as typeof NumberEditorInner;
