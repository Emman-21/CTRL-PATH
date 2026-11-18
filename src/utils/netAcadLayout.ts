export interface ModuleNavSummary {
  currentNumber: number;
  totalCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  shortLabel: string;
}

/**
 * Computes mobile/desktop module navigation metadata for the NetAcad reader bar.
 */
export function getModuleNavSummary(
  modules: ReadonlyArray<{ moduleNumber?: number; title: string }>,
  selectedIndex: number
): ModuleNavSummary {
  const totalCount = modules.length;
  if (totalCount === 0) {
    return {
      currentNumber: 0,
      totalCount: 0,
      canGoPrev: false,
      canGoNext: false,
      shortLabel: 'No modules',
    };
  }

  const safeIndex = Math.max(0, Math.min(selectedIndex, totalCount - 1));
  const current = modules[safeIndex];
  const currentNumber = current?.moduleNumber || safeIndex + 1;
  const cleanTitle = (current?.title || '').replace(/^Module \d+:\s*/i, '').trim();

  return {
    currentNumber,
    totalCount,
    canGoPrev: safeIndex > 0,
    canGoNext: safeIndex < totalCount - 1,
    shortLabel: cleanTitle ? `Mod ${currentNumber}: ${cleanTitle}` : `Module ${currentNumber}`,
  };
}

/**
 * Mobile & compact tablet viewports (< 1024px) start with the module drawer collapsed
 * so presentation slides get the full viewport width immediately.
 */
export function shouldDefaultCollapseSidebar(viewportWidth: number): boolean {
  return viewportWidth < 1024;
}
