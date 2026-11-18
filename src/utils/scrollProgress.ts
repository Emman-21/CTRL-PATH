export interface ScrollProgressInput {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  hasEmbeddedPdf: boolean;
  pdfSlidesCount: number;
  renderedSlideSlots?: number;
  isResettingScroll?: boolean;
}

export interface ScrollProgressResult {
  shouldIgnore: boolean;
  percentage: number;
  isComplete: boolean;
}

export function calculateReaderScrollProgress({
  scrollTop,
  scrollHeight,
  clientHeight,
  hasEmbeddedPdf,
  pdfSlidesCount,
  renderedSlideSlots,
  isResettingScroll = false,
}: ScrollProgressInput): ScrollProgressResult {
  if (isResettingScroll) {
    return { shouldIgnore: true, percentage: 0, isComplete: false };
  }

  if (hasEmbeddedPdf) {
    // Never update progress or mark completion while the PDF document is still loading
    if (pdfSlidesCount <= 0) {
      return { shouldIgnore: true, percentage: 0, isComplete: false };
    }

    // Wait until all slide containers are mounted in the DOM so scrollHeight reflects the full deck
    if (typeof renderedSlideSlots === 'number' && renderedSlideSlots < pdfSlidesCount) {
      return { shouldIgnore: true, percentage: 0, isComplete: false };
    }
  }

  const maxScroll = scrollHeight - clientHeight;

  // Multi-slide PDF decks are always taller than the viewport once laid out; ignore premature maxScroll <= 0
  if (hasEmbeddedPdf && pdfSlidesCount > 1 && maxScroll <= 0) {
    return { shouldIgnore: true, percentage: 0, isComplete: false };
  }

  const rawPct =
    maxScroll <= 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));

  const isComplete =
    maxScroll <= 0 || rawPct >= 98 || scrollTop + clientHeight >= scrollHeight - 35;

  return {
    shouldIgnore: false,
    percentage: isComplete ? 100 : rawPct,
    isComplete,
  };
}
