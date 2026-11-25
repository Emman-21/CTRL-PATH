import { useEffect } from 'react';

let activeLockCount = 0;
let savedBodyOverflow: string | null = null;

/**
 * Acquires a reference-counted body scroll lock so overlapping panels/modals
 * never prematurely re-enable background scrolling when one closes.
 * Returns an idempotent release function.
 */
export function acquireBodyScrollLock(doc: Document | undefined = typeof document !== 'undefined' ? document : undefined): () => void {
  if (!doc?.body) {
    return () => {};
  }

  if (activeLockCount === 0) {
    savedBodyOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
  }
  activeLockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;

    activeLockCount = Math.max(0, activeLockCount - 1);
    if (activeLockCount === 0 && doc.body) {
      doc.body.style.overflow = savedBodyOverflow ?? '';
      savedBodyOverflow = null;
    }
  };
}

export function getBodyScrollLockCount(): number {
  return activeLockCount;
}

export function resetBodyScrollLockForTests(doc?: Document): void {
  activeLockCount = 0;
  savedBodyOverflow = null;
  if (doc?.body) {
    doc.body.style.overflow = '';
  }
}

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const release = acquireBodyScrollLock();
    return () => {
      release();
    };
  }, [locked]);
}
