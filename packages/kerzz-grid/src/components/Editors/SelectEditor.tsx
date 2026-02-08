import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { CellEditorProps } from '../../types/editing.types';
import type { SelectEditorOption } from '../../types/editing.types';

interface SelectEditorInternalProps<TData> extends CellEditorProps<TData> {
  options: SelectEditorOption[];
  onSaveAndMoveNext?: CellEditorProps<TData>['onSaveAndMoveNext'];
}

function SelectEditorInner<TData>({
  value,
  options,
  onSave,
  onCancel,
  onSaveAndMoveNext,
}: SelectEditorInternalProps<TData>): React.ReactElement {
  const currentValue = value != null ? String(value) : '';
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(options.findIndex((o) => o.id === currentValue), 0),
  );
  // Guard: prevent accidental selection from double-click propagation
  const [armed, setArmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Current selected option label
  const currentLabel = useMemo(() => {
    const found = options.find((o) => o.id === currentValue);
    return found?.name ?? currentValue;
  }, [options, currentValue]);

  useEffect(() => {
    containerRef.current?.focus();
    // Arm after a short delay so the double-click's second mousedown
    // doesn't accidentally trigger a selection on a dropdown item.
    const timer = setTimeout(() => setArmed(true), 80);
    return () => clearTimeout(timer);
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

  const handleSelectAndMove = useCallback(
    (option: SelectEditorOption, direction: 'tab' | 'enter') => {
      if (onSaveAndMoveNext) {
        onSaveAndMoveNext(option.id, direction);
      } else {
        onSave(option.id);
      }
    },
    [onSave, onSaveAndMoveNext],
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
          if (options[highlightedIndex]) handleSelectAndMove(options[highlightedIndex], 'enter');
          break;
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
        case 'Tab':
          e.preventDefault();
          if (options[highlightedIndex]) handleSelectAndMove(options[highlightedIndex], 'tab');
          break;
      }
    },
    [options, highlightedIndex, handleSelectAndMove, onCancel],
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
      {/* Trigger: shows current value */}
      <div className="kz-editor__select-trigger">
        <span className="kz-editor__select-trigger-label">{currentLabel}</span>
        <svg className="kz-editor__select-trigger-chevron" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown: below trigger */}
      <div ref={listRef} className="kz-editor__dropdown">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`kz-editor__dropdown-item${
              index === highlightedIndex ? ' kz-editor__dropdown-item--highlighted' : ''
            }${option.id === currentValue ? ' kz-editor__dropdown-item--selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              // Only allow selection after the arm delay
              if (armed) {
                handleSelect(option);
              }
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

export const SelectEditor = React.memo(SelectEditorInner) as typeof SelectEditorInner;
