import type { QuizQuestion } from '../types/quiz';

/**
 * Returns true if the keyboard event target is a text-entry or native select control
 * where single-character or arrow shortcuts should not hijack typing.
 */
export function isTypingElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; isContentEditable?: boolean; type?: string };
  if (el.isContentEditable) return true;
  const tag = (el.tagName || '').toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Returns true if the target (or one of its ancestors via optional callback/closest)
 * is an interactive button or link that handles Enter/Space natively.
 */
export function isInteractiveControl(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; closest?: (selector: string) => unknown };
  if (typeof el.closest === 'function') {
    return Boolean(el.closest('button, a[href], select, summary, [role="tab"], [role="option"]'));
  }
  const tag = (el.tagName || '').toUpperCase();
  return tag === 'BUTTON' || tag === 'A' || tag === 'SELECT' || tag === 'SUMMARY';
}

export interface ReaderScrollInput {
  key: string;
  shiftKey?: boolean;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/**
 * Computes the next scrollTop for the Track Explorer / NetAcad Reader pane,
 * or null if the key is not a reader scroll key.
 */
export function computeReaderScrollTop(input: ReaderScrollInput): number | null {
  const { key, shiftKey = false, scrollTop, scrollHeight, clientHeight } = input;
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  const lineStep = 96;
  const pageStep = Math.max(160, Math.round(clientHeight * 0.85));

  switch (key) {
    case 'ArrowDown':
      return Math.min(maxScroll, scrollTop + lineStep);
    case 'ArrowUp':
      return Math.max(0, scrollTop - lineStep);
    case 'PageDown':
      return Math.min(maxScroll, scrollTop + pageStep);
    case 'PageUp':
      return Math.max(0, scrollTop - pageStep);
    case ' ':
    case 'Spacebar':
      return shiftKey
        ? Math.max(0, scrollTop - pageStep)
        : Math.min(maxScroll, scrollTop + pageStep);
    case 'Home':
      return 0;
    case 'End':
      return maxScroll;
    default:
      return null;
  }
}

/**
 * Updates the active highlighted index inside a keyboard-navigable dropdown list.
 */
export function getNextDropdownIndex(
  currentIndex: number,
  key: string,
  itemCount: number
): number {
  if (itemCount <= 0) return -1;
  switch (key) {
    case 'ArrowDown':
      return currentIndex < 0 ? 0 : (currentIndex + 1) % itemCount;
    case 'ArrowUp':
      return currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
    case 'Home':
      return 0;
    case 'End':
      return itemCount - 1;
    default:
      return currentIndex;
  }
}

export type QuizShortcutAction =
  | { type: 'select_answer'; value: unknown }
  | { type: 'next_question' }
  | { type: 'prev_question' }
  | { type: 'none' };

export interface QuizShortcutParams {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  question: QuizQuestion;
  currentValue: unknown;
  isCurrentQuestionAnswered: boolean;
  canProceedNext: boolean;
  hasPrevQuestion: boolean;
  isTyping: boolean;
  focusedOnButton: boolean;
  focusedOnAnswerOption?: boolean;
  focusedOnSequencingStep?: boolean;
}

/**
 * Resolves global/card-level keyboard shortcuts for an active CTRL Quiz question.
 */
export function resolveQuizShortcut(params: QuizShortcutParams): QuizShortcutAction {
  const {
    key,
    altKey = false,
    ctrlKey = false,
    metaKey = false,
    question,
    currentValue,
    isCurrentQuestionAnswered,
    canProceedNext,
    hasPrevQuestion,
    isTyping,
    focusedOnButton,
    focusedOnAnswerOption = false,
    focusedOnSequencingStep = false,
  } = params;

  // Never intercept browser/system modifier combos like Cmd+R or Ctrl+K
  if (ctrlKey || metaKey) {
    return { type: 'none' };
  }

  // Alt+Left / Alt+Right work anywhere (even inside an input) for prev/next question
  if (altKey && key === 'ArrowLeft') {
    return hasPrevQuestion ? { type: 'prev_question' } : { type: 'none' };
  }
  if (altKey && key === 'ArrowRight') {
    return canProceedNext ? { type: 'next_question' } : { type: 'none' };
  }
  if (altKey) {
    return { type: 'none' };
  }

  // Enter to proceed once answered:
  // - Allowed when typing inside single-line Identification input (CtrlQuizPage/Identification handles multi-field jump)
  // - Allowed when focus is NOT on a different button, OR when focused on an already-selected MC/TF option, OR on a Sequencing item
  if (key === 'Enter') {
    if (!canProceedNext || !isCurrentQuestionAnswered) {
      return { type: 'none' };
    }
    if (isTyping || !focusedOnButton || focusedOnAnswerOption || focusedOnSequencingStep) {
      return { type: 'next_question' };
    }
    return { type: 'none' };
  }

  // Do not fire single-key answer shortcuts while typing in text inputs
  if (isTyping) {
    return { type: 'none' };
  }

  const lower = key.toLowerCase();

  if (question.type === 'true_false') {
    if (lower === 't' || key === '1') {
      return { type: 'select_answer', value: true };
    }
    if (lower === 'f' || key === '2') {
      return { type: 'select_answer', value: false };
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const nextVal = currentValue === undefined ? key === 'ArrowLeft' : !currentValue;
      return { type: 'select_answer', value: nextVal };
    }
  }

  if (question.type === 'multiple_choice') {
    const keyMap: Record<string, number> = {
      '1': 0,
      a: 0,
      '2': 1,
      b: 1,
      '3': 2,
      c: 2,
      '4': 3,
      d: 3,
    };
    if (lower in keyMap && question.options[keyMap[lower]]) {
      return { type: 'select_answer', value: question.options[keyMap[lower]].key };
    }
    if (key === 'ArrowDown' || key === 'ArrowRight') {
      const currentIdx = question.options.findIndex((o) => o.key === currentValue);
      const nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % question.options.length;
      return { type: 'select_answer', value: question.options[nextIdx].key };
    }
    if (key === 'ArrowUp' || key === 'ArrowLeft') {
      const currentIdx = question.options.findIndex((o) => o.key === currentValue);
      const nextIdx =
        currentIdx <= 0 ? question.options.length - 1 : currentIdx - 1;
      return { type: 'select_answer', value: question.options[nextIdx].key };
    }
  }

  return { type: 'none' };
}
