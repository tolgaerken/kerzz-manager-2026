import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from "react";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "../../../hooks/useIsMobile";

export interface CollapsibleSectionProps {
  /** Başlık ikonu */
  icon?: ReactNode;
  /** Başlık metni */
  title: string;
  /** Opsiyonel badge sayısı */
  count?: number;
  /** Sağ tarafa yerleştirilecek butonlar (desktop) */
  desktopActions?: ReactNode;
  /** Sağ tarafa yerleştirilecek butonlar (mobil - collapsible içinde) */
  mobileActions?: ReactNode;
  /** Collapsible içerik */
  children: ReactNode;
  /** Başlangıç durumu (varsayılan: true) */
  defaultExpanded?: boolean;
  /** Mobilde sticky header olsun mu? (varsayılan: true) */
  stickyOnMobile?: boolean;
  /** Dışarıdan kontrol edilen expanded state (opsiyonel) */
  expanded?: boolean;
  /** Expanded değiştiğinde callback */
  onExpandedChange?: (expanded: boolean) => void;
}

export function CollapsibleSection({
  icon,
  title,
  count,
  desktopActions,
  mobileActions,
  children,
  defaultExpanded = true,
  stickyOnMobile = true,
  expanded: controlledExpanded,
  onExpandedChange,
}: CollapsibleSectionProps) {
  const isMobile = useIsMobile();

  // Internal state (uncontrolled mode)
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const filtersContentRef = useRef<HTMLDivElement>(null);
  const [filtersContentHeight, setFiltersContentHeight] = useState(0);

  // Controlled vs uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const setExpanded = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (isControlled) {
        const newValue = typeof value === "function" ? value(controlledExpanded!) : value;
        onExpandedChange?.(newValue);
      } else {
        setInternalExpanded(value);
      }
    },
    [isControlled, controlledExpanded, onExpandedChange]
  );

  // Manuel toggle sonrası bir süre otomatik değişimi engelle
  useEffect(() => {
    if (isManualToggle) {
      const timeout = setTimeout(() => setIsManualToggle(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isManualToggle]);

  // Mobilde içerik yüksekliğini ölçerek gerçek max-height animasyonu uygula
  useEffect(() => {
    if (!isMobile) return;

    const contentElement = filtersContentRef.current;
    if (!contentElement) return;

    const updateHeight = () => {
      setFiltersContentHeight(contentElement.scrollHeight);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(contentElement);
    return () => resizeObserver.disconnect();
  }, [isMobile, children]);

  const mobileFiltersCollapseStyle = useMemo<CSSProperties | undefined>(() => {
    if (!isMobile) return undefined;

    return {
      maxHeight: isExpanded ? `${Math.max(filtersContentHeight, 1)}px` : "0px",
      opacity: isExpanded ? 1 : 0,
      pointerEvents: isExpanded ? "auto" : "none",
      transition: "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease",
      willChange: "max-height, opacity",
    };
  }, [isMobile, isExpanded, filtersContentHeight]);

  // Manuel toggle handler
  const handleToggleFilters = useCallback(() => {
    setIsManualToggle(true);
    setExpanded((prev) => !prev);
  }, [setExpanded]);

  // Scroll direction callback - dışarıdan çağrılabilir
  const handleScrollDirectionChange = useCallback(
    (direction: "up" | "down" | null, isAtTop: boolean) => {
      if (!isMobile || isManualToggle) return;

      if (direction === "down" && !isAtTop) {
        setExpanded(false);
      } else if (direction === "up" || isAtTop) {
        setExpanded(true);
      }
    },
    [isMobile, isManualToggle, setExpanded]
  );

  return {
    containerProps: {
      className: `flex-shrink-0 mb-3 overflow-hidden rounded-lg border border-border bg-surface ${
        isMobile && stickyOnMobile ? "sticky top-0 z-20" : ""
      }`,
    },
    headerContent: (
      <div className="flex items-center justify-between p-3 md:p-4">
        {/* Title & Count */}
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h1 className="text-base md:text-lg font-semibold text-foreground">{title}</h1>
          {count !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {count}
            </span>
          )}
        </div>

        {/* Actions + Toggle */}
        <div className="flex items-center gap-2">
          {/* Toggle button (mobile only) */}
          {isMobile && (
            <button
              onClick={handleToggleFilters}
              className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              aria-label={isExpanded ? "Filtreleri gizle" : "Filtreleri göster"}
            >
              <span
                className={`transform transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
          )}

          {/* Desktop actions - always visible on desktop */}
          {!isMobile && desktopActions}
        </div>
      </div>
    ),
    collapsibleContent: (
      <div className="overflow-hidden" style={mobileFiltersCollapseStyle}>
        <div ref={filtersContentRef}>
          <div className="flex flex-col gap-3 px-3 pb-3 md:gap-4 md:px-4 md:pb-4">
            {/* Mobile Actions */}
            {isMobile && mobileActions}

            {/* Children (filters, etc.) */}
            {children}
          </div>
        </div>
      </div>
    ),
    handleScrollDirectionChange,
    isExpanded,
    isMobile,
  };
}

/** Render helper - tam bileşen olarak kullanmak için */
export interface CollapsibleSectionContainerProps extends CollapsibleSectionProps {
  /** Render prop - scroll direction handler'ı almak için */
  renderContent?: (props: {
    handleScrollDirectionChange: (direction: "up" | "down" | null, isAtTop: boolean) => void;
    isExpanded: boolean;
    isMobile: boolean;
  }) => ReactNode;
}

export function CollapsibleSectionContainer({
  renderContent,
  ...props
}: CollapsibleSectionContainerProps) {
  const {
    containerProps,
    headerContent,
    collapsibleContent,
    handleScrollDirectionChange,
    isExpanded,
    isMobile,
  } = CollapsibleSection(props);

  return (
    <>
      <div {...containerProps}>
        {headerContent}
        {collapsibleContent}
      </div>
      {renderContent?.({ handleScrollDirectionChange, isExpanded, isMobile })}
    </>
  );
}
