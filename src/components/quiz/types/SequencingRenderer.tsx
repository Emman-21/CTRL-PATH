import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SequencingQuestion } from '../../../types/quiz';
import {
  computeSequencingDropIndex,
  getShuffledSequencingSteps,
  reorderSequencingSteps,
} from '../../../utils/quizEngine';
import { GripVertical, RotateCcw, Check } from 'lucide-react';

export interface SequencingRendererProps {
  question: SequencingQuestion;
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  disabled?: boolean;
}

interface DragState {
  step: string;
  startIndex: number;
  currentIndex: number;
  startX: number;
  startY: number;
  pointerY: number;
  isDragging: boolean;
  slotMidpoints: number[];
}

export const SequencingRenderer: React.FC<SequencingRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
}) => {
  const initialShuffledSteps = useMemo(
    () => getShuffledSequencingSteps(question),
    [question]
  );

  // If no student order is recorded yet, display the deterministically shuffled steps
  const hasRecordedOrder = Boolean(value && value.length === question.steps.length);
  const currentSteps = hasRecordedOrder ? value! : initialShuffledSteps;

  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentStepsRef = useRef<string[]>(currentSteps);
  currentStepsRef.current = currentSteps;

  // Clear active drag when switching questions or disabling
  useEffect(() => {
    dragRef.current = null;
    setDragState(null);
  }, [question.id, disabled]);

  const displayedSteps = useMemo(() => {
    if (!dragState || !dragState.isDragging) return currentSteps;
    return reorderSequencingSteps(
      currentSteps,
      dragState.startIndex,
      dragState.currentIndex
    );
  }, [currentSteps, dragState]);

  const hasActivePointerSession = dragState !== null;

  useEffect(() => {
    if (!hasActivePointerSession) return;

    const handlePointerMove = (e: PointerEvent) => {
      const active = dragRef.current;
      if (!active) return;

      const dist = Math.hypot(e.clientX - active.startX, e.clientY - active.startY);
      const isDragging = active.isDragging || dist > 4;
      if (!isDragging) return;

      const nextIndex = computeSequencingDropIndex(active.slotMidpoints, e.clientY);
      const nextState: DragState = {
        ...active,
        isDragging: true,
        pointerY: e.clientY,
        currentIndex: nextIndex,
      };
      dragRef.current = nextState;
      setDragState(nextState);
    };

    const finishDrag = () => {
      const active = dragRef.current;
      if (!active) return;

      dragRef.current = null;
      setDragState(null);

      if (!disabled && active.isDragging && active.currentIndex !== active.startIndex) {
        const nextOrder = reorderSequencingSteps(
          currentStepsRef.current,
          active.startIndex,
          active.currentIndex
        );
        onChange(nextOrder);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [hasActivePointerSession, disabled, onChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, idx: number, step: string) => {
    if (disabled || e.button !== 0) return;

    const slotMidpoints = currentSteps.map((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

    const initial: DragState = {
      step,
      startIndex: idx,
      currentIndex: idx,
      startX: e.clientX,
      startY: e.clientY,
      pointerY: e.clientY,
      isDragging: false,
      slotMidpoints,
    };

    dragRef.current = initial;
    setDragState(initial);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      onChange(reorderSequencingSteps(currentSteps, idx, idx - 1));
    } else if (e.key === 'ArrowDown' && idx < currentSteps.length - 1) {
      e.preventDefault();
      onChange(reorderSequencingSteps(currentSteps, idx, idx + 1));
    }
  };

  const handleReset = () => {
    if (disabled) return;
    onChange([...initialShuffledSteps]);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Drag and drop steps from first (1) to last ({currentSteps.length}):
        </span>
        <div className="flex items-center gap-3">
          {!hasRecordedOrder && !disabled && (
            <button
              type="button"
              onClick={() => onChange([...currentSteps])}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/40 text-[11px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Confirm Order</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Order</span>
          </button>
        </div>
      </div>

      <div
        role="list"
        aria-label="Sequence steps from first to last"
        data-testid="sequencing-list"
        className="space-y-2 select-none"
      >
        {displayedSteps.map((step, idx) => {
          const isDraggingThis = Boolean(dragState?.isDragging && dragState.step === step);

          return (
            <div
              key={step}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              role="listitem"
              tabIndex={disabled ? -1 : 0}
              aria-roledescription="draggable step"
              aria-label={`Position ${idx + 1} of ${displayedSteps.length}: ${step}. Drag to reorder or press Up and Down arrow keys.`}
              data-testid={`sequencing-step-${idx}`}
              data-step-text={step}
              data-dragging={isDraggingThis ? 'true' : 'false'}
              onPointerDown={(e) => handlePointerDown(e, idx, step)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all touch-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                disabled
                  ? 'border-slate-200 bg-[#ffffff] dark:border-slate-700/90 dark:bg-slate-900/90 cursor-default opacity-80'
                  : isDraggingThis
                  ? 'border-blue-500 bg-[#eff6ff] dark:border-blue-400 dark:bg-[#112247] shadow-lg ring-2 ring-blue-400/50 scale-[1.015] z-20 relative cursor-grabbing'
                  : 'border-slate-200 bg-[#ffffff] hover:border-blue-300 dark:border-slate-700/90 dark:bg-slate-900/90 dark:hover:border-sky-400/70 shadow-2xs cursor-grab active:cursor-grabbing'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border transition-colors ${
                    isDraggingThis
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-400'
                      : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400/40'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-semibold leading-snug">
                  {step}
                </span>
              </div>

              <div
                aria-hidden="true"
                className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${
                  isDraggingThis
                    ? 'text-blue-600 bg-blue-100/80 dark:text-blue-300 dark:bg-blue-500/20'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
