import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isQuestionAnswered,
  getUnansweredQuestionIndices,
  isChapterComplete,
  getShuffledSequencingSteps,
} from '../src/utils/quizEngine';
import { QUIZ_QUESTIONS } from '../src/data/quiz/quizQuestions';
import type {
  TrueFalseQuestion,
  MultipleChoiceQuestion,
  MatchingQuestion,
  SequencingQuestion,
  IdentificationQuestion,
} from '../src/types/quiz';

const tfQuestion = QUIZ_QUESTIONS.find((q): q is TrueFalseQuestion => q.type === 'true_false')!;
const mcQuestion = QUIZ_QUESTIONS.find((q): q is MultipleChoiceQuestion => q.type === 'multiple_choice')!;
const matchQuestion = QUIZ_QUESTIONS.find((q): q is MatchingQuestion => q.type === 'matching')!;
const seqQuestion = QUIZ_QUESTIONS.find((q): q is SequencingQuestion => q.type === 'sequencing')!;
const idSingleQuestion = QUIZ_QUESTIONS.find(
  (q): q is IdentificationQuestion => q.type === 'identification' && !q.isEnumeration
)!;
const idEnumQuestion = QUIZ_QUESTIONS.find(
  (q): q is IdentificationQuestion => q.type === 'identification' && Boolean(q.isEnumeration)
)!;

test('isQuestionAnswered validates true_false and multiple_choice strictly', () => {
  assert.equal(isQuestionAnswered(tfQuestion, undefined), false);
  assert.equal(isQuestionAnswered(tfQuestion, true), true);
  assert.equal(isQuestionAnswered(tfQuestion, false), true);

  assert.equal(isQuestionAnswered(mcQuestion, undefined), false);
  assert.equal(isQuestionAnswered(mcQuestion, ''), false);
  assert.equal(isQuestionAnswered(mcQuestion, 'B'), true);
});

test('isQuestionAnswered requires all pairs on matching and all fields on identification', () => {
  assert.equal(isQuestionAnswered(matchQuestion, undefined), false);
  const partialMatch = { [matchQuestion.pairs[0].term]: matchQuestion.pairs[0].definition };
  assert.equal(isQuestionAnswered(matchQuestion, partialMatch), false);

  const fullMatch = Object.fromEntries(matchQuestion.pairs.map((p) => [p.term, p.definition]));
  assert.equal(isQuestionAnswered(matchQuestion, fullMatch), true);

  assert.equal(isQuestionAnswered(idSingleQuestion, '   '), false);
  assert.equal(isQuestionAnswered(idSingleQuestion, 'OSI Model'), true);

  assert.equal(isQuestionAnswered(idEnumQuestion, ['one', 'two', '   ']), false);
  assert.equal(isQuestionAnswered(idEnumQuestion, ['one', 'two', 'three']), true);
});

test('isQuestionAnswered validates sequencing and getShuffledSequencingSteps avoids identity order', () => {
  assert.equal(isQuestionAnswered(seqQuestion, undefined), false);
  assert.equal(isQuestionAnswered(seqQuestion, ['only one']), false);
  assert.equal(isQuestionAnswered(seqQuestion, [...seqQuestion.steps]), true);

  const shuffled = getShuffledSequencingSteps(seqQuestion);
  assert.equal(shuffled.length, seqQuestion.steps.length);
  assert.deepEqual([...shuffled].sort(), [...seqQuestion.steps].sort());
  assert.notDeepEqual(shuffled, seqQuestion.steps);
});

test('getUnansweredQuestionIndices and isChapterComplete block advancing until every question in chapter is answered', () => {
  const level1Ids = QUIZ_QUESTIONS.filter((q) => q.level === 1).map((q) => q.id);
  assert.equal(level1Ids.length, 9);

  const partialAnswers: Record<string, unknown> = {};
  level1Ids.forEach((id, idx) => {
    if (idx !== 2 && idx !== 7) {
      partialAnswers[id] = true;
    }
  });

  assert.deepEqual(getUnansweredQuestionIndices(level1Ids, partialAnswers), [2, 7]);
  assert.equal(isChapterComplete(level1Ids, partialAnswers), false);

  const completeAnswers = {
    ...partialAnswers,
    [level1Ids[2]]: false,
    [level1Ids[7]]: true,
  };
  assert.deepEqual(getUnansweredQuestionIndices(level1Ids, completeAnswers), []);
  assert.equal(isChapterComplete(level1Ids, completeAnswers), true);
  assert.equal(isChapterComplete([], completeAnswers), false);
});
