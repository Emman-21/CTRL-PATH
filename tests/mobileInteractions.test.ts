import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBottomBarOffsetPx,
  isKeyboardOpenFromViewport,
} from '../src/hooks/useBottomBarOffset';
import {
  acquireBodyScrollLock,
  getBodyScrollLockCount,
  resetBodyScrollLockForTests,
} from '../src/hooks/useBodyScrollLock';

test('isKeyboardOpenFromViewport detects keyboard collapse using 0.75 threshold cleanly', () => {
  assert.equal(isKeyboardOpenFromViewport(844, 844), false);
  assert.equal(isKeyboardOpenFromViewport(700, 844), false);
  // Exact 0.75 boundary (633 / 844 = 0.75) should not trigger false positive
  assert.equal(isKeyboardOpenFromViewport(633, 844), false);
  assert.equal(isKeyboardOpenFromViewport(632, 844), true);
  assert.equal(isKeyboardOpenFromViewport(460, 844), true);
  // Guards against invalid/zero viewport metrics
  assert.equal(isKeyboardOpenFromViewport(0, 844), false);
  assert.equal(isKeyboardOpenFromViewport(500, 0), false);
  assert.equal(isKeyboardOpenFromViewport(Number.NaN, 844), false);
});

test('computeBottomBarOffsetPx computes positive offsets and returns 0 when absent', () => {
  assert.equal(computeBottomBarOffsetPx(0), 0);
  assert.equal(computeBottomBarOffsetPx(-12), 0);
  assert.equal(computeBottomBarOffsetPx(Number.NaN), 0);
  assert.equal(computeBottomBarOffsetPx(72), 88);
  assert.equal(computeBottomBarOffsetPx(72.4, 12), 85);
});

test('acquireBodyScrollLock reference-counts nested overlays and restores original body overflow', () => {
  const mockDoc = {
    body: {
      style: {
        overflow: 'auto',
      },
    },
  } as unknown as Document;

  resetBodyScrollLockForTests(mockDoc);
  mockDoc.body.style.overflow = 'auto';

  const releaseFirst = acquireBodyScrollLock(mockDoc);
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(mockDoc.body.style.overflow, 'hidden');

  const releaseSecond = acquireBodyScrollLock(mockDoc);
  assert.equal(getBodyScrollLockCount(), 2);
  assert.equal(mockDoc.body.style.overflow, 'hidden');

  // Releasing out of order must keep body locked until all locks release
  releaseFirst();
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(mockDoc.body.style.overflow, 'hidden');

  // Calling release again on the same lock handle must be idempotent
  releaseFirst();
  assert.equal(getBodyScrollLockCount(), 1);
  assert.equal(mockDoc.body.style.overflow, 'hidden');

  // Releasing final lock restores initial overflow
  releaseSecond();
  assert.equal(getBodyScrollLockCount(), 0);
  assert.equal(mockDoc.body.style.overflow, 'auto');
});
