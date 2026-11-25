import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DASHBOARD_LUNI_IDLE_GRID,
  DASHBOARD_LUNI_IDLE_SEQUENCE,
  DASHBOARD_LUNI_POSE_SHEETS,
  DASHBOARD_LUNI_WAVE_GRID,
  DASHBOARD_LUNI_WAVE_SEQUENCE,
  computeAlignedPlacement,
  computeSpriteBounds,
  getIdleCellRects,
  isNearWhiteBackground,
  removeCrescentAndSparkleAura,
  removeExteriorWhiteBackground,
} from '../src/utils/dashboardLuniIdle';

test('3x2 idle (2528x1696) and 5x1 wave (3584x1184) sprite sheets divide cleanly without gaps', () => {
  const idleRects = getIdleCellRects(2528, 1696, DASHBOARD_LUNI_IDLE_GRID.cols, DASHBOARD_LUNI_IDLE_GRID.rows);
  assert.equal(idleRects.length, DASHBOARD_LUNI_IDLE_GRID.totalFrames);
  assert.equal(idleRects[0].x, 0);
  assert.equal(idleRects[0].y, 0);
  assert.equal(idleRects[2].x + idleRects[2].width, 2528);
  assert.equal(idleRects[5].y + idleRects[5].height, 1696);

  const waveRects = getIdleCellRects(3584, 1184, DASHBOARD_LUNI_WAVE_GRID.cols, DASHBOARD_LUNI_WAVE_GRID.rows);
  assert.equal(waveRects.length, DASHBOARD_LUNI_WAVE_GRID.totalFrames);
  assert.equal(waveRects[0].x, 0);
  assert.equal(waveRects[4].x + waveRects[4].width, 3584);
  assert.equal(waveRects[4].height, 1184);
  assert.equal(DASHBOARD_LUNI_POSE_SHEETS.wave.cleanWhiteBg, true);
  assert.equal(DASHBOARD_LUNI_POSE_SHEETS.wave.cleanAura, false);
});

test('idle and wave sequences reference valid frames with positive durations', () => {
  const visitedIdle = new Set<number>();
  for (const step of DASHBOARD_LUNI_IDLE_SEQUENCE) {
    assert.ok(step.frameIndex >= 0 && step.frameIndex < DASHBOARD_LUNI_IDLE_GRID.totalFrames);
    assert.ok(step.durationMs > 0);
    visitedIdle.add(step.frameIndex);
  }
  assert.equal(visitedIdle.has(2), true); // ^ ^ blink frame

  const visitedWave = new Set<number>();
  for (const step of DASHBOARD_LUNI_WAVE_SEQUENCE) {
    assert.ok(step.frameIndex >= 0 && step.frameIndex < DASHBOARD_LUNI_WAVE_GRID.totalFrames);
    assert.ok(step.durationMs > 0);
    visitedWave.add(step.frameIndex);
  }
  assert.equal(visitedWave.has(2), true); // cheerful ^ ^ wave frame
  assert.equal(visitedWave.has(4), true); // sparkle settle frame
});

test('removeCrescentAndSparkleAura clears left pastel crescent and un-outlined sparkles while preserving Luni outline and body', () => {
  const w = 30;
  const h = 30;
  const data = new Uint8ClampedArray(w * h * 4);

  // Left pastel crescent at x=2..4, y=8..20 (no dark outline)
  for (let y = 8; y <= 20; y++) {
    for (let x = 2; x <= 4; x++) {
      const p = (y * w + x) * 4;
      data[p] = 140;
      data[p + 1] = 175;
      data[p + 2] = 250;
      data[p + 3] = 250;
    }
  }

  // Detached top-right sparkle at x=24..26, y=3..5 (no dark outline)
  for (let y = 3; y <= 5; y++) {
    for (let x = 24; x <= 26; x++) {
      const p = (y * w + x) * 4;
      data[p] = 170;
      data[p + 1] = 195;
      data[p + 2] = 252;
      data[p + 3] = 245;
    }
  }

  // Main Luni body at x=8..22, y=6..24 with dark navy outline + white interior
  for (let y = 6; y <= 24; y++) {
    for (let x = 8; x <= 22; x++) {
      const p = (y * w + x) * 4;
      const isBorder = x === 8 || x === 22 || y === 6 || y === 24;
      if (isBorder) {
        data[p] = 18;
        data[p + 1] = 20;
        data[p + 2] = 88;
        data[p + 3] = 255;
      } else {
        data[p] = 250;
        data[p + 1] = 248;
        data[p + 2] = 255;
        data[p + 3] = 255;
      }
    }
  }

  removeCrescentAndSparkleAura(data, w, h);

  // Crescent and sparkle cleared
  assert.equal(data[(12 * w + 3) * 4 + 3], 0);
  assert.equal(data[(4 * w + 25) * 4 + 3], 0);
  // Luni outline and white interior preserved
  assert.equal(data[(12 * w + 8) * 4 + 3], 255);
  assert.equal(data[(12 * w + 15) * 4 + 3], 255);
});

test('exterior white flood-fill removes white and faint outer fringes while keeping interior white opaque', () => {
  const w = 7;
  const h = 7;
  const data = new Uint8ClampedArray(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const isOutline =
        x >= 1 && x <= 5 && y >= 1 && y <= 5 && (x === 1 || x === 5 || y === 1 || y === 5);

      if (x === 0 && y === 0) {
        data[p] = 140;
        data[p + 1] = 142;
        data[p + 2] = 145;
        data[p + 3] = 4;
      } else if (isOutline) {
        data[p] = 28;
        data[p + 1] = 24;
        data[p + 2] = 68;
        data[p + 3] = 255;
      } else {
        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
        data[p + 3] = 255;
      }
    }
  }

  removeExteriorWhiteBackground(data, w, h);

  assert.equal(data[3], 0);
  assert.equal(data[7], 0);
  assert.equal(data[(1 * w + 1) * 4 + 3], 255);
  assert.equal(data[(3 * w + 3) * 4 + 3], 255);
});

test('isNearWhiteBackground preserves pastel crescent and sparkle colors', () => {
  assert.equal(isNearWhiteBackground(255, 255, 255), true);
  assert.equal(isNearWhiteBackground(242, 244, 248), true);
  assert.equal(isNearWhiteBackground(255, 224, 120), false);
  assert.equal(isNearWhiteBackground(190, 208, 252), false);
});

test('computeAlignedPlacement keeps body anchor horizontally centered across sparkle changes', () => {
  const w = 40;
  const h = 40;
  const makeBuffer = (withLeftAura: boolean) => {
    const buf = new Uint8ClampedArray(w * h * 4);
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

  const p1 = computeAlignedPlacement(boundsNoAura, 30, 148);
  const p2 = computeAlignedPlacement(boundsWithAura, 30, 148);

  const bodyCenter1 = p1.dx + (boundsNoAura.anchorX - boundsNoAura.minX) * (p1.dw / boundsNoAura.width);
  const bodyCenter2 = p2.dx + (boundsWithAura.anchorX - boundsWithAura.minX) * (p2.dw / boundsWithAura.width);
  assert.ok(Math.abs(bodyCenter1 - 74) < 0.001);
  assert.ok(Math.abs(bodyCenter2 - 74) < 0.001);
});
