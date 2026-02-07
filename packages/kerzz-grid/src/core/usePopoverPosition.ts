import { useState, useCallback, useLayoutEffect, useRef } from 'react';

export interface PopoverPosition {
  top: number;
  left: number;
}

interface UsePopoverPositionOptions {
  /** Where to align relative to trigger: 'bottom-left' | 'bottom-right' */
  align?: 'bottom-left' | 'bottom-right';
  /** Offset from trigger edge */
  offsetY?: number;
}

/**
 * Calculates the fixed position for a popover/dropdown relative
 * to a trigger element, using getBoundingClientRect.
 * Returns a ref to attach to the trigger and the calculated position.
 */
export function usePopoverPosition(
  isOpen: boolean,
  options: UsePopoverPositionOptions = {},
) {
  const { align = 'bottom-left', offsetY = 2 } = options;
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverEl = popoverRef.current;

    let top = rect.bottom + offsetY;
    let left = align === 'bottom-right' ? rect.right : rect.left;

    // Adjust if popover would go off-screen
    if (popoverEl) {
      const popoverRect = popoverEl.getBoundingClientRect();

      // Don't go below viewport
      if (top + popoverRect.height > window.innerHeight) {
        top = rect.top - popoverRect.height - offsetY;
      }

      // Don't go right of viewport
      if (align === 'bottom-left' && left + popoverRect.width > window.innerWidth) {
        left = window.innerWidth - popoverRect.width - 8;
      }

      // Don't go left of viewport for bottom-right
      if (align === 'bottom-right') {
        left = left - popoverRect.width;
        if (left < 0) left = 8;
      }

      // Don't go left of viewport
      if (left < 0) left = 8;
    }

    setPosition({ top, left });
  }, [align, offsetY]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      // Recalculate on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  return { triggerRef, popoverRef, position };
}
