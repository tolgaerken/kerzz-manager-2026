import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface PortalProps {
  children: ReactNode;
}

/**
 * Renders children into document.body via React portal.
 * This ensures dropdown/popover elements are not clipped by
 * parent overflow:hidden containers.
 */
export function Portal({ children }: PortalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
