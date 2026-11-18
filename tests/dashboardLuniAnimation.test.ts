import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DASHBOARD_LUNI_GRID,
  DASHBOARD_LUNI_WAVE_SEQUENCE,
  computeAlignedPlacement,
  computeSpriteBounds,
  getSpriteCellRects,
  isNearWhiteBackground,
  removeExteriorWhiteBackground,
} from '../src/utils/dashboardLuniAnimation';

test('sprite sheet grid produces 6 cells in 3x2 order without gaps', () => {
  const rects = getSpriteCellRects(2048, 2048);
  assert.equal(rects.length, DASHBOARD_LUNI_GRID.totalFrames);
  assert.equal(rects[0].x, 0);
  assert.equal(rects[0].y, 0);
  assert.equal(rects[2].x + rects[2].width, 2048);
  assert.equal(rects[5].y + rects[5].height, 2048);
});

test('wave sequence uses valid frame indices and positive durations', () => {
  assert.ok(DASHBOARD_LUNI_WAVE_SEQUENCE.length >= 6);
  for (const step of DASHBOARD_LUNI_WAVE_SEQUENCE) {
    assert.ok(step.frameIndex >= 0 && step.frameIndex < DASHBOARD_LUNI_GRID.totalFrames);
    assert.ok(step.durationMs > 0);
  }
  // Must visit the raised waving & sparkle frames (2 and 3)
  const visited = new Set(DASHBOARD_LUNI_WAVE_SEQUENCE.map((s) => s.frameIndex));
  assert.equal(visited.has(2), true);
  assert.equal(visited.has(3), true);
});

test('exterior white flood-fill removes outer white while keeping enclosed white hair opaque', () => {
  // 7x7 synthetic pixel art:
  // outer white -> dark outline at ring 1..5 -> interior white at (2..4, 2..4)
  const w = 7;
  const h = 7;
  const data = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const isOutline =
        x >= 1 && x <= 5 && y >= 1 && y <= 5 && (x === 1 || x === 5 || y === 1 || y === 5);

      if (isOutline) {
        data[p] = 28;
        data[p + 1] = 24;
        data[p + 2] = 68;
      } else {
        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
      }
      data[p + 3] = 255;
    }
  }

  removeExteriorWhiteBackground(data, w, h);

  // Outer corner (0,0) must be transparent
  assert.equal(data[3], 0);
  // Dark outline (1,1) stays opaque
  assert.equal(data[(1 * w + 1) * 4 + 3], 255);
  // Enclosed white center (3,3) stays 100% opaque
  assert.equal(data[(3 * w + 3) * 4 + 3], 255);
});

test('isNearWhiteBackground preserves pastel crescent and golden sparkle hues', () => {
  assert.equal(isNearWhiteBackground(255, 255, 255), true);
  assert.equal(isNearWhiteBackground(242, 244, 248), true);
  assert.equal(isNearWhiteBackground(255, 224, 120), false); // yellow sparkle
  assert.equal(isNearWhiteBackground(190, 208, 252), false); // pastel moon aura
});

test('computeAlignedPlacement keeps body anchor centered regardless of side aura width', () => {
  const w = 40;
  const h = 40;
  const makeBuffer = (withLeftAura: boolean) => {
    const buf = new Uint8ClampedArray(w * h * 4);
    // Body centered around x=24, y=10..35
    for (let y = 10; y <= 35; y++) {
      for (let x = 20; x <= 28; x++) {
        const p = (y * w + x) * 4;
        buf[p] = 60;
        buf[p + 1] = 70;
        buf[p + 2] = 140;
        buf[p + 3] = 255;
      }
    }
    if (withLeftAura) {
      // Detached crescent aura in upper-left (x=4..8, y=10..20)
      for (let y = 10; y <= 20; y++) {
        for (let x = 4; x <= 8; x++) {
          const p = (y * w + x) * 4;
          buf[p] = 170;
          buf[p + 1] = 190;
          buf[p + 2] = 250;
          buf[p + 3] = 255;
        }
      }
    }
    return buf;
  };

  const boundsNoAura = computeSpriteBounds(makeBuffer(false), w, h);
  const boundsWithAura = computeSpriteBounds(makeBuffer(true), w, h);

  assert.equal(boundsNoAura.anchorX, 24);
  assert.equal(boundsWithAura.anchorX, 24);

  const p1 = computeAlignedPlacement(boundsNoAura, 30, 148);
  const p2 = computeAlignedPlacement(boundsWithAura, 30, 148);

  // Body center stays at targetSize / 2 = 74 in both frames
  const bodyCenter1 = p1.dx + (boundsNoAura.anchorX - boundsNoAura.minX) * (p1.dw / boundsNoAura.width);
  const bodyCenter2 = p2.dx + (boundsWithAura.anchorX - boundsWithAura.minX) * (p2.dw / boundsWithAura.width);
  assert.ok(Math.abs(bodyCenter1 - 74) < 0.001);
  assert.ok(Math.abs(bodyCenter2 - 74) < 0.001);
});
