import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReaderScrollTop,
  getNextDropdownIndex,
  isTypingElement,
  resolveQuizShortcut,
} from '../src/utils/keyboardNav';
import type {
  IdentificationQuestion,
  MultipleChoiceQuestion,
  SequencingQuestion,
  TrueFalseQuestion,
} from '../src/types/quiz';

const tfQuestion: TrueFalseQuestion = {
  id: 'tf-1',
  level: 1,
  track: 'NT',
  type: 'true_false',
  prompt: 'IPv6 uses 128-bit addresses.',
  correctAnswer: true,
};

const mcQuestion: MultipleChoiceQuestion = {
  id: 'mc-1',
  level: 2,
  track: 'BA',
  type: 'multiple_choice',
  prompt: 'Which chart best shows trends over time?',
  options: [
    { key: 'A', text: 'Pie Chart' },
    { key: 'B', text: 'Line Chart' },
    { key: 'C', text: 'Scatter Plot' },
    { key: 'D', text: 'Word Cloud' },
  ],
  correctAnswer: 'B',
};

const idQuestion: IdentificationQuestion = {
  id: 'id-1',
  level: 3,
  track: 'SM',
  type: 'identification',
  prompt: 'What stands for Service Level Agreement?',
  acceptedAnswers: ['SLA'],
};

const seqQuestion: SequencingQuestion = {
  id: 'seq-1',
  level: 5,
  track: 'NT',
  type: 'sequencing',
  prompt: 'Order the steps.',
  steps: ['Step 1', 'Step 2', 'Step 3'],
};

test('resolveQuizShortcut advances with Enter once a question is answered', () => {
  // Unanswered: Enter does not advance
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: mcQuestion,
      currentValue: undefined,
      isCurrentQuestionAnswered: false,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'none' }
  );

  // Answered with focus on card/body: Enter advances
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: mcQuestion,
      currentValue: 'B',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'next_question' }
  );

  // Answered with focus on an already-selected MC option button: Enter advances
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: mcQuestion,
      currentValue: 'B',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: true,
      focusedOnAnswerOption: true,
    }),
    { type: 'next_question' }
  );

  // Answered with focus on a separate button like Previous: Enter does not hijack the button
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: mcQuestion,
      currentValue: 'B',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: true,
      isTyping: false,
      focusedOnButton: true,
      focusedOnAnswerOption: false,
    }),
    { type: 'none' }
  );

  // Typing in Identification input and answered: Enter advances
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: idQuestion,
      currentValue: 'SLA',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: true,
      focusedOnButton: false,
    }),
    { type: 'next_question' }
  );

  // Focused on a Sequencing step: Enter advances when order is confirmed
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'Enter',
      question: seqQuestion,
      currentValue: ['Step 1', 'Step 2', 'Step 3'],
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: true,
      isTyping: false,
      focusedOnButton: false,
      focusedOnSequencingStep: true,
    }),
    { type: 'next_question' }
  );
});

test('resolveQuizShortcut supports True/False and Multiple Choice option keys without hijacking typing', () => {
  assert.deepEqual(
    resolveQuizShortcut({
      key: 't',
      question: tfQuestion,
      currentValue: undefined,
      isCurrentQuestionAnswered: false,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'select_answer', value: true }
  );

  assert.deepEqual(
    resolveQuizShortcut({
      key: '2',
      question: tfQuestion,
      currentValue: true,
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'select_answer', value: false }
  );

  assert.deepEqual(
    resolveQuizShortcut({
      key: '2',
      question: mcQuestion,
      currentValue: undefined,
      isCurrentQuestionAnswered: false,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'select_answer', value: 'B' }
  );

  assert.deepEqual(
    resolveQuizShortcut({
      key: 'ArrowDown',
      question: mcQuestion,
      currentValue: 'B',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: false,
      focusedOnButton: false,
    }),
    { type: 'select_answer', value: 'C' }
  );

  // Does not fire option shortcut while typing
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'a',
      question: mcQuestion,
      currentValue: undefined,
      isCurrentQuestionAnswered: false,
      canProceedNext: true,
      hasPrevQuestion: false,
      isTyping: true,
      focusedOnButton: false,
    }),
    { type: 'none' }
  );
});

test('resolveQuizShortcut supports Alt+ArrowLeft and Alt+ArrowRight navigation', () => {
  assert.deepEqual(
    resolveQuizShortcut({
      key: 'ArrowLeft',
      altKey: true,
      question: idQuestion,
      currentValue: 'SLA',
      isCurrentQuestionAnswered: true,
      canProceedNext: true,
      hasPrevQuestion: true,
      isTyping: true,
      focusedOnButton: false,
    }),
    { type: 'prev_question' }
  );

  assert.deepEqual(
    resolveQuizShortcut({
      key: 'ArrowRight',
      altKey: true,
      question: idQuestion,
      currentValue: 'SLA',
      isCurrentQuestionAnswered: true,
      canProceedNext: false,
      hasPrevQuestion: true,
      isTyping: true,
      focusedOnButton: false,
    }),
    { type: 'none' }
  );
});

test('computeReaderScrollTop handles ArrowUp, ArrowDown, PageUp, PageDown, Space, Home, and End', () => {
  assert.equal(
    computeReaderScrollTop({
      key: 'ArrowDown',
      scrollTop: 0,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    96
  );

  assert.equal(
    computeReaderScrollTop({
      key: 'ArrowUp',
      scrollTop: 40,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    0
  );

  assert.equal(
    computeReaderScrollTop({
      key: 'PageDown',
      scrollTop: 100,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    780
  );

  assert.equal(
    computeReaderScrollTop({
      key: ' ',
      shiftKey: true,
      scrollTop: 800,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    120
  );

  assert.equal(
    computeReaderScrollTop({
      key: 'End',
      scrollTop: 100,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    1200
  );

  assert.equal(
    computeReaderScrollTop({
      key: 'Home',
      scrollTop: 500,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    0
  );

  assert.equal(
    computeReaderScrollTop({
      key: 'Enter',
      scrollTop: 0,
      scrollHeight: 2000,
      clientHeight: 800,
    }),
    null
  );
});

test('getNextDropdownIndex wraps cleanly for ArrowDown, ArrowUp, Home, and End', () => {
  assert.equal(getNextDropdownIndex(-1, 'ArrowDown', 5), 0);
  assert.equal(getNextDropdownIndex(4, 'ArrowDown', 5), 0);
  assert.equal(getNextDropdownIndex(-1, 'ArrowUp', 5), 4);
  assert.equal(getNextDropdownIndex(0, 'ArrowUp', 5), 4);
  assert.equal(getNextDropdownIndex(2, 'Home', 5), 0);
  assert.equal(getNextDropdownIndex(1, 'End', 5), 4);
  assert.equal(getNextDropdownIndex(0, 'ArrowDown', 0), -1);
});

test('isTypingElement identifies inputs, textareas, selects, and contentEditable', () => {
  assert.equal(isTypingElement({ tagName: 'INPUT' } as unknown as EventTarget), true);
  assert.equal(isTypingElement({ tagName: 'textarea' } as unknown as EventTarget), true);
  assert.equal(isTypingElement({ tagName: 'SELECT' } as unknown as EventTarget), true);
  assert.equal(isTypingElement({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget), true);
  assert.equal(isTypingElement({ tagName: 'BUTTON' } as unknown as EventTarget), false);
});
