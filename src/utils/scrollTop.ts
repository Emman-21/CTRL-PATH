export function scrollViewportToTop(): void {
  if (typeof window === 'undefined') return;
  if (typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
  if (typeof document !== 'undefined') {
    document.documentElement.scrollTop = 0;
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }
}
