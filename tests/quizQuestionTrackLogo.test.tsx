import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { StudentProvider } from '../src/context/StudentContext';
import { QuizQuestionRenderer } from '../src/components/quiz/QuizQuestionRenderer';
import { CtrlQuizPage } from '../src/pages/CtrlQuizPage';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';

test('CtrlQuizPage keeps the single track SVG logo in the chapter navigator and QuizQuestionRenderer omits the duplicate card badge', () => {
  const prevStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  try {
    const cases = [
      { track: 'NT' as const },
      { track: 'BA' as const },
      { track: 'SM' as const },
    ];

    for (const c of cases) {
      const q = QUIZ_QUESTIONS.find((item) => item.track === c.track)!;
      const rendererHtml = renderToStaticMarkup(
        <StudentProvider>
          <QuizQuestionRenderer question={q} value={undefined} onChange={() => {}} />
        </StudentProvider>,
      );

      assert.ok(!rendererHtml.includes('data-testid="quiz-question-track-badge"'));

      store.set(
        'ctrl_path_quiz_session_v1',
        JSON.stringify({
          attemptId: 'attempt-test',
          attemptNumber: 1,
          startedAt: new Date().toISOString(),
          currentLevel: 1,
          currentQuestionIndex: 0,
          shuffledQuestionsByLevel: { 1: [q.id], 2: [], 3: [], 4: [], 5: [] },
          answers: {},
          isCompleted: false,
          levelPrepSeen: { 1: true },
        }),
      );

      const pageHtml = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/quiz']}>
          <StudentProvider>
            <CtrlQuizPage />
          </StudentProvider>
        </MemoryRouter>,
      );

      assert.ok(pageHtml.includes(`>${c.track}</text>`));
      assert.ok(!pageHtml.includes('data-testid="quiz-question-track-badge"'));
    }
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
});
