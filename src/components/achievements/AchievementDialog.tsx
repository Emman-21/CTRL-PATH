import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export function AchievementDialog({ titleId, onClose, children, reducedMotion = false, closeLabel = 'Close achievement dialog' }: {
  titleId: string; onClose: () => void; children: ReactNode; reducedMotion?: boolean; closeLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useBodyScrollLock(true);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <dialog ref={ref} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose(); }}
      onKeyDown={e => {
        if (e.key !== 'Tab') return;
        const targets = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]'));
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }}
      data-reduced-motion={reducedMotion} className="achievement-dialog" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="achievement-dialog-content">
        <button autoFocus className="achievement-close" aria-label={closeLabel} onClick={onClose}><X size={20} /></button>
        {children}
      </div>
    </dialog>, document.body);
}
