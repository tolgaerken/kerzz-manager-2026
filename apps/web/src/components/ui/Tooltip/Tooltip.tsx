import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}

export function Tooltip({ 
  content, 
  children, 
  position = "right",
  disabled = false 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    switch (position) {
      case "right":
        setCoords({ top: rect.top + rect.height / 2, left: rect.right + gap });
        break;
      case "left":
        setCoords({ top: rect.top + rect.height / 2, left: rect.left - gap });
        break;
      case "top":
        setCoords({ top: rect.top - gap, left: rect.left + rect.width / 2 });
        break;
      case "bottom":
        setCoords({ top: rect.bottom + gap, left: rect.left + rect.width / 2 });
        break;
    }
  }, [position]);

  const showTooltip = () => {
    if (disabled) return;
    updatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const transformClasses: Record<string, string> = {
    top: "-translate-x-1/2 -translate-y-full",
    right: "-translate-y-1/2",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {isVisible && !disabled &&
        createPortal(
          <div
            className={`fixed z-[9999] whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-lg ${transformClasses[position]}`}
            style={{ top: coords.top, left: coords.left }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
