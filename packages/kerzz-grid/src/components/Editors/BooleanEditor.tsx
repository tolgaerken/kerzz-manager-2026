import React, { useCallback } from 'react';
import type { CellEditorProps } from '../../types/editing.types';

/**
 * Boolean editor: immediately toggles the value and saves.
 * No interactive UI needed — the toggle happens on activation.
 */
export function BooleanEditor<TData>({ value, onSave }: CellEditorProps<TData>) {
  // Toggle immediately on mount
  const handleToggle = useCallback(() => {
    onSave(!value);
  }, [value, onSave]);

  // Call toggle on first render via a ref trick
  React.useEffect(() => {
    handleToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
