import { useEffect } from 'react';

export interface VisualViewportLike {
  height: number;
  addEventListener: (type: 'resize' | 'scroll', listener: () => void) => void;
  removeEventListener: (type: 'resize' | 'scroll', listener: () => void) => void;
}

export interface WindowWithVisualViewport {
  visualViewport?: VisualViewportLike | null;
}

/**
 * Subscribes to window.visualViewport resize/scroll events and keeps the
 * CSS custom property `--vvh` synced to the live visual viewport height (in px).
 * Falls back cleanly when visualViewport is unavailable.
 */
export function syncVisualViewportHeight(
  win: WindowWithVisualViewport | undefined = typeof window !== 'undefined' ? window : undefined,
  doc: Document | undefined = typeof document !== 'undefined' ? document : undefined,
): () => void {
  const vv = win?.visualViewport;
  const rootStyle = doc?.documentElement?.style;
  if (!vv || !rootStyle) {
    return () => {};
  }

  const update = () => {
    const height = Math.max(0, Math.round(vv.height));
    rootStyle.setProperty('--vvh', `${height}px`);
  };

  update();
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);

  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
    rootStyle.removeProperty('--vvh');
  };
}

export function useVisualViewportHeight(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return syncVisualViewportHeight();
  }, [active]);
}
