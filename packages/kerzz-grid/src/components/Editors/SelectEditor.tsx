import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';
import type { SelectEditorOption } from '../../types/editing.types';

interface SelectEditorInternalProps<TData> extends CellEditorProps<TData> {
  options: SelectEditorOption[];
}

export function SelectEditor<TData>({
  value,
  options,
  onSave,
  onCancel,
}: SelectEditorInternalProps<TData>) {
  const currentValue = value != null ? String(value) : '';
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(options.findIndex((o) => o.id === currentValue), 0),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Scroll to highlighted
  useEffect(() => {
    if (listRef.current && options.length > 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, options.length]);

  const handleSelect = useCallback(
    (option: SelectEditorOption) => {
      onSave(option.id);
    },
    [onSave],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (options[highlightedIndex]) handleSelect(options[highlightedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
        case 'Tab':
          e.preventDefault();
          if (options[highlightedIndex]) handleSelect(options[highlightedIndex]);
          break;
      }
    },
    [options, highlightedIndex, handleSelect, onCancel],
  );

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="kz-editor kz-editor--select"
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        // Only cancel if focus leaves the entire editor
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          onCancel();
        }
      }}
    >
      <div ref={listRef} className="kz-editor__dropdown">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`kz-editor__dropdown-item${
              index === highlightedIndex ? ' kz-editor__dropdown-item--highlighted' : ''
            }${option.id === currentValue ? ' kz-editor__dropdown-item--selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(option);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
}
