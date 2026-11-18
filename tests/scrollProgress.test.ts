import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReaderScrollProgress } from '../src/utils/scrollProgress';

test('ignores scroll events while embedded PDF is still loading (pdfSlidesCount === 0)', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 50,
    scrollHeight: 650,
    clientHeight: 800,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 0,
    renderedSlideSlots: 0,
  });

  assert.deepEqual(result, {
    shouldIgnore: true,
    percentage: 0,
    isComplete: false,
  });
});

test('ignores scroll events before all PDF slide slots are mounted in the DOM', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 100,
    scrollHeight: 700,
    clientHeight: 800,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 44,
    renderedSlideSlots: 0,
  });

  assert.deepEqual(result, {
    shouldIgnore: true,
    percentage: 0,
    isComplete: false,
  });
});

test('ignores multi-slide PDF scroll if layout has not expanded beyond viewport yet', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 20,
    scrollHeight: 750,
    clientHeight: 800,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 44,
    renderedSlideSlots: 44,
  });

  assert.deepEqual(result, {
    shouldIgnore: true,
    percentage: 0,
    isComplete: false,
  });
});

test('tracks partial scroll percentage accurately once PDF slides are laid out', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 10000,
    scrollHeight: 25800,
    clientHeight: 800,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 44,
    renderedSlideSlots: 44,
  });

  assert.deepEqual(result, {
    shouldIgnore: false,
    percentage: 40,
    isComplete: false,
  });
});

test('marks embedded PDF complete when scrolled to bottom', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 24980,
    scrollHeight: 25800,
    clientHeight: 800,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 44,
    renderedSlideSlots: 44,
  });

  assert.deepEqual(result, {
    shouldIgnore: false,
    percentage: 100,
    isComplete: true,
  });
});

test('preserves normal scroll completion for text-based modules without embedded PDF', () => {
  const mid = calculateReaderScrollProgress({
    scrollTop: 500,
    scrollHeight: 2800,
    clientHeight: 800,
    hasEmbeddedPdf: false,
    pdfSlidesCount: 0,
  });
  assert.deepEqual(mid, {
    shouldIgnore: false,
    percentage: 25,
    isComplete: false,
  });

  const shortModule = calculateReaderScrollProgress({
    scrollTop: 0,
    scrollHeight: 600,
    clientHeight: 800,
    hasEmbeddedPdf: false,
    pdfSlidesCount: 0,
  });
  assert.deepEqual(shortModule, {
    shouldIgnore: false,
    percentage: 100,
    isComplete: true,
  });
});

test('ignores scroll events while resetting scroll position on PDF load transition', () => {
  const result = calculateReaderScrollProgress({
    scrollTop: 39812,
    scrollHeight: 40328,
    clientHeight: 516,
    hasEmbeddedPdf: true,
    pdfSlidesCount: 66,
    renderedSlideSlots: 66,
    isResettingScroll: true,
  });

  assert.deepEqual(result, {
    shouldIgnore: true,
    percentage: 0,
    isComplete: false,
  });
});
