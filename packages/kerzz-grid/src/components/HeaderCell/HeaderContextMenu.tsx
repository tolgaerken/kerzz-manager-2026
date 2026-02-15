import React, { useCallback, useEffect, useRef } from 'react';
import type { ColumnPinPosition } from '../../types/grid.types';

export interface HeaderContextMenuProps {
  /** Current pin position of the column */
  currentPinPosition: ColumnPinPosition;
  /** Position for the context menu */
  position: { top: number; left: number };
  /** Callback when pin action is selected */
  onPinChange: (position: ColumnPinPosition) => void;
  /** Callback to close the menu */
  onClose: () => void;
  /** Locale for translations */
  locale?: 'tr' | 'en';
}

const translations = {
  tr: {
    pinLeft: 'Sola Sabitle',
    pinRight: 'Sağa Sabitle',
    unpin: 'Sabitlemeyi Kaldır',
  },
  en: {
    pinLeft: 'Pin to Left',
    pinRight: 'Pin to Right',
    unpin: 'Unpin',
  },
};

/**
 * Context menu for header cell with pin/unpin actions
 */
export function HeaderContextMenu({
  currentPinPosition,
  position,
  onPinChange,
  onClose,
  locale = 'tr',
}: HeaderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding listener to avoid immediate close from the triggering click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePinLeft = useCallback(() => {
    onPinChange('left');
    onClose();
  }, [onPinChange, onClose]);

  const handlePinRight = useCallback(() => {
    onPinChange('right');
    onClose();
  }, [onPinChange, onClose]);

  const handleUnpin = useCallback(() => {
    onPinChange(false);
    onClose();
  }, [onPinChange, onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = { ...position };
  if (typeof window !== 'undefined') {
    const menuWidth = 180;
    const menuHeight = 120;
    
    if (position.left + menuWidth > window.innerWidth) {
      adjustedPosition.left = window.innerWidth - menuWidth - 8;
    }
    if (position.top + menuHeight > window.innerHeight) {
      adjustedPosition.top = window.innerHeight - menuHeight - 8;
    }
    if (adjustedPosition.left < 8) {
      adjustedPosition.left = 8;
    }
    if (adjustedPosition.top < 8) {
      adjustedPosition.top = 8;
    }
  }

  return (
    <div
      ref={menuRef}
      className="kz-header-context-menu"
      style={{
        position: 'fixed',
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        zIndex: 100000,
      }}
    >
      {/* Pin Left */}
      <button
        type="button"
        className={`kz-header-context-menu__item ${currentPinPosition === 'left' ? 'kz-header-context-menu__item--active' : ''}`}
        onClick={handlePinLeft}
      >
        <svg
          className="kz-header-context-menu__icon"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 3C2 2.44772 2.44772 2 3 2H5C5.55228 2 6 2.44772 6 3V13C6 13.5523 5.55228 14 5 14H3C2.44772 14 2 13.5523 2 13V3Z"
            fill="currentColor"
          />
          <path
            d="M8 4H14M8 8H14M8 12H12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>{t.pinLeft}</span>
        {currentPinPosition === 'left' && (
          <svg
            className="kz-header-context-menu__check"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8L6.5 11.5L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Pin Right */}
      <button
        type="button"
        className={`kz-header-context-menu__item ${currentPinPosition === 'right' ? 'kz-header-context-menu__item--active' : ''}`}
        onClick={handlePinRight}
      >
        <svg
          className="kz-header-context-menu__icon"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H11C10.4477 14 10 13.5523 10 13V3Z"
            fill="currentColor"
          />
          <path
            d="M2 4H8M2 8H8M4 12H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>{t.pinRight}</span>
        {currentPinPosition === 'right' && (
          <svg
            className="kz-header-context-menu__check"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 8L6.5 11.5L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Unpin - only show if currently pinned */}
      {currentPinPosition !== false && (
        <button
          type="button"
          className="kz-header-context-menu__item"
          onClick={handleUnpin}
        >
          <svg
            className="kz-header-context-menu__icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 2L13 14M2 4H6M2 8H8M4 12H10M10 4H14M10 8H14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>{t.unpin}</span>
        </button>
      )}
    </div>
  );
}
