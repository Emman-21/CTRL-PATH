import { useEffect, useRef } from 'react';
import type React from 'react';

export function isKeyboardOpenFromViewport(visualViewportHeight: number, innerHeight: number): boolean {
  if (!Number.isFinite(visualViewportHeight) || !Number.isFinite(innerHeight)) {
    return false;
  }
  if (visualViewportHeight <= 0 || innerHeight <= 0) {
    return false;
  }
  return visualViewportHeight < innerHeight * 0.75;
}

export function computeBottomBarOffsetPx(barHeight: number, bottomMarginPx = 16): number {
  if (!Number.isFinite(barHeight) || barHeight <= 0) {
    return 0;
  }
  const safeMargin = Number.isFinite(bottomMarginPx) && bottomMarginPx > 0 ? bottomMarginPx : 0;
  return Math.ceil(barHeight + safeMargin);
}

/**
 * Tracks the height of a sticky bottom bar and exposes it via `--bottom-bar-h`
 * on `:root` so floating Luni and achievement toasts stack cleanly above it.
 */
export function useBottomBarOffset(active: boolean): React.RefObject<HTMLDivElement | null> {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rootStyle = typeof document !== 'undefined' ? document.documentElement.style : null;
    if (!rootStyle) return;

    if (!active) {
      rootStyle.removeProperty('--bottom-bar-h');
      return;
    }

    const syncHeight = () => {
      const el = barRef.current;
      const rectHeight = el ? el.getBoundingClientRect().height : 0;
      const offsetPx = computeBottomBarOffsetPx(rectHeight);
      if (offsetPx > 0) {
        rootStyle.setProperty('--bottom-bar-h', `${offsetPx}px`);
      } else {
        rootStyle.removeProperty('--bottom-bar-h');
      }
    };

    syncHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && barRef.current) {
      observer = new ResizeObserver(syncHeight);
      observer.observe(barRef.current);
    }

    window.addEventListener('resize', syncHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncHeight);
      rootStyle.removeProperty('--bottom-bar-h');
    };
  }, [active]);

  return barRef;
}
