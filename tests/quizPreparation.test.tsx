import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudentProvider } from '../src/context/StudentContext';
import { QuizPreparation } from '../src/components/quiz/QuizPreparation';
import { QuizQuestionRenderer } from '../src/components/quiz/QuizQuestionRenderer';
import { LUNI_POSES } from '../src/assets/manifest';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';

test('QuizPreparation uses the cheer pose and QuizQuestionRenderer uses the question mark curious pose', () => {
  const prevStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };

  try {
    const prepHtml = renderToStaticMarkup(
      <StudentProvider>
        <QuizPreparation levelNumber={1} onBeginLevel={() => {}} />
      </StudentProvider>,
    );

    assert.ok(prepHtml.includes('/assets/aistudio/luni_cheer_413e2f61.png'));
    assert.ok(prepHtml.includes(LUNI_POSES.quiz_cheer.url));

    const question = QUIZ_QUESTIONS[0];
    const questionHtml = renderToStaticMarkup(
      <StudentProvider>
        <QuizQuestionRenderer question={question} value={undefined} onChange={() => {}} />
      </StudentProvider>,
    );

    assert.ok(questionHtml.includes('/assets/pictures/13_curious_8bfef2de.png'));
    assert.ok(questionHtml.includes(LUNI_POSES.curious.url));
    assert.ok(!questionHtml.includes('/assets/aistudio/luni_cheer_413e2f61.png'));
  } finally {
    if (prevStorage === undefined) {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = prevStorage;
    }
  }
});
