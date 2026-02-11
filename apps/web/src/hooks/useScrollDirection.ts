import { useState, useEffect, useCallback, type RefObject } from "react";

interface UseScrollDirectionResult {
  scrollDirection: "up" | "down" | null;
  isAtTop: boolean;
}

/**
 * Container'ın scroll yönünü ve en üstte olup olmadığını izler.
 * @param containerRef - İzlenecek scroll container'ın ref'i
 * @param threshold - Yön değişikliği için minimum scroll miktarı (px)
 */
export function useScrollDirection(
  containerRef: RefObject<HTMLElement | null>,
  threshold = 10
): UseScrollDirectionResult {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const atTop = currentScrollTop <= 0;

    setIsAtTop(atTop);

    // Threshold'u aşan scroll varsa yön belirle
    const scrollDiff = currentScrollTop - lastScrollTop;

    if (Math.abs(scrollDiff) >= threshold) {
      if (scrollDiff > 0) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      setLastScrollTop(currentScrollTop);
    }
  }, [containerRef, lastScrollTop, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // İlk değerleri ayarla
    setLastScrollTop(container.scrollTop);
    setIsAtTop(container.scrollTop <= 0);

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, handleScroll]);

  return { scrollDirection, isAtTop };
}
