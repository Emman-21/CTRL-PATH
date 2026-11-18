import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSequencingDropIndex,
  reorderSequencingSteps,
} from '../src/utils/quizEngine';

test('reorderSequencingSteps moves items forward and backward without mutating original array', () => {
  const original = ['Step A', 'Step B', 'Step C', 'Step D'];

  const movedDown = reorderSequencingSteps(original, 0, 2);
  assert.deepEqual(movedDown, ['Step B', 'Step C', 'Step A', 'Step D']);
  assert.deepEqual(original, ['Step A', 'Step B', 'Step C', 'Step D']);

  const movedUp = reorderSequencingSteps(original, 3, 1);
  assert.deepEqual(movedUp, ['Step A', 'Step D', 'Step B', 'Step C']);

  const sameSpot = reorderSequencingSteps(original, 1, 1);
  assert.deepEqual(sameSpot, original);
  assert.notEqual(sameSpot, original);

  const outOfBounds = reorderSequencingSteps(original, -1, 2);
  assert.deepEqual(outOfBounds, original);
});

test('computeSequencingDropIndex maps pointer Y coordinates inside each card to its slot index', () => {
  // 4 cards with vertical centers at 130, 198, 266, 334 (boundaries at 164, 232, 300)
  const midpoints = [130, 198, 266, 334];

  assert.equal(computeSequencingDropIndex(midpoints, 80), 0);
  assert.equal(computeSequencingDropIndex(midpoints, 150), 0);
  assert.equal(computeSequencingDropIndex(midpoints, 170), 1);
  assert.equal(computeSequencingDropIndex(midpoints, 220), 1);
  assert.equal(computeSequencingDropIndex(midpoints, 240), 2);
  assert.equal(computeSequencingDropIndex(midpoints, 290), 2);
  assert.equal(computeSequencingDropIndex(midpoints, 310), 3);
  assert.equal(computeSequencingDropIndex(midpoints, 450), 3);
});
