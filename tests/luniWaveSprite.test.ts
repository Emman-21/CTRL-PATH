import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LUNI_GREET_PENDING_KEY,
  clearLuniLoginGreetPending,
  consumeLuniLoginGreetPending,
  hasLuniLoginGreetPending,
  markLuniLoginGreetPending,
  shouldPlayLuniLoginGreet,
} from '../src/utils/luniLoginGreet';
import {
  LUNI_WAVE_DURATION_MS,
  LUNI_WAVE_FPS,
  LUNI_WAVE_FRAME_COUNT,
  computeLuniDisplayDimensions,
  computeNormalizedSheetScale,
  computeReferenceBodyHeight,
  computeSharedHorizontalSheetCrop,
  computeUnifiedPoseCropPlans,
  measureSheetMedianBodyHeight,
} from '../src/utils/luniWaveSprite';
import fs from 'node:fs';
import path from 'node:path';
import {
  LUNI_POSES,
  getLuniBounceMetrics,
  getLuniLoginGreetPoseId,
  getPoseDurationMs,
  getPoseEffectDelayMs,
  getRandomTapLuniPoses,
  pickRandomLuniPose,
} from '../src/data/luniSpritePoses';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  clear() {
    this.map.clear();
  }
}

test('wave only once per login: DashboardLuniIdle plays on "/" then flag is removed for refresh & navigation', () => {
  const session = new MemoryStorage();

  // Existing session / refresh before any fresh login: must NOT wave
  assert.equal(hasLuniLoginGreetPending(session), false);
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'dashboard',
      storage: session,
    }),
    false,
  );
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'widget',
      storage: session,
    }),
    false,
  );

  // Fresh login sets ctrl_path_luni_greet_pending_v1 = "1"
  markLuniLoginGreetPending(session);
  assert.equal(session.getItem(LUNI_GREET_PENDING_KEY), '1');

  // On "/", DashboardLuniIdle claims the wave while LuniAssistantWidget defers
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'dashboard',
      storage: session,
    }),
    true,
  );
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'widget',
      storage: session,
    }),
    false,
  );

  // When DashboardLuniIdle fires the ~500ms wave, it immediately consumes & removes the flag
  assert.equal(consumeLuniLoginGreetPending(session), true);
  assert.equal(session.getItem(LUNI_GREET_PENDING_KEY), null);

  // Second consume / refresh / navigating to another page does NOT replay
  assert.equal(consumeLuniLoginGreetPending(session), false);
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'dashboard',
      storage: session,
    }),
    false,
  );
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/tracks',
      component: 'widget',
      storage: session,
    }),
    false,
  );
});

test('wave only once per login: LuniAssistantWidget plays when landing on non-dashboard route, then clears flag', () => {
  const session = new MemoryStorage();
  markLuniLoginGreetPending(session);

  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/tracks',
      component: 'widget',
      storage: session,
    }),
    true,
  );

  assert.equal(consumeLuniLoginGreetPending(session), true);
  assert.equal(session.getItem(LUNI_GREET_PENDING_KEY), null);

  // Navigating to "/" afterward does NOT replay
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'dashboard',
      storage: session,
    }),
    false,
  );
});

test('auto-wave after login is suppressed when luniEnabled is false or quiz focus/answering is active', () => {
  const session = new MemoryStorage();
  markLuniLoginGreetPending(session);

  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/',
      component: 'dashboard',
      luniEnabled: false,
      storage: session,
    }),
    false,
  );
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/quiz',
      component: 'widget',
      isQuizFocusMode: true,
      storage: session,
    }),
    false,
  );
  assert.equal(
    shouldPlayLuniLoginGreet({
      pathname: '/quiz',
      component: 'widget',
      isQuizAnswering: true,
      storage: session,
    }),
    false,
  );

  clearLuniLoginGreetPending(session);
  assert.equal(hasLuniLoginGreetPending(session), false);
});

test('computeSharedHorizontalSheetCrop computes one shared union bounding box and locks feet to the same baseline', () => {
  const fw = 20;
  const fh = 24;

  const paintRect = (minX: number, maxX: number, minY: number, maxY: number) => {
    const buf = new Uint8ClampedArray(fw * fh * 4);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = (y * fw + x) * 4;
        buf[p] = 100;
        buf[p + 1] = 130;
        buf[p + 2] = 250;
        buf[p + 3] = 255;
      }
    }
    return buf;
  };

  // Frame 0: x 4..12, y 5..20 (bottom at 20)
  // Frame 1: wave arm extends to x=15, feet higher by 2px (y 5..18)
  const frames = [
    paintRect(4, 12, 5, 20),
    paintRect(4, 15, 5, 18),
    paintRect(4, 14, 4, 20),
    paintRect(4, 15, 5, 19),
    paintRect(4, 13, 5, 20),
    paintRect(4, 12, 5, 20),
  ];

  const plan = computeSharedHorizontalSheetCrop(frames, fw, fh);
  assert.equal(plan.unionMinX, 4);
  assert.equal(plan.unionMaxX, 15);
  assert.equal(plan.unionMinY, 4);
  assert.equal(plan.unionMaxY, 20);
  assert.equal(plan.cropWidth, 12);
  assert.equal(plan.cropHeight, 17);
  assert.equal(plan.baselineY, 16);

  // Frame 1 had bottom at y=18 vs unionMaxY=20 -> shifted down 2px to keep feet on the same baseline
  assert.equal(plan.placements[0].destY, 0);
  assert.equal(plan.placements[1].destY, 2);
  assert.equal(plan.placements[3].destY, 1);

  // Constant wave playback settings (~10 FPS, 6 frames = 600ms)
  assert.equal(LUNI_WAVE_FRAME_COUNT, 6);
  assert.equal(LUNI_WAVE_FPS, 10);
  assert.equal(LUNI_WAVE_DURATION_MS, 600);
});

test('computeLuniDisplayDimensions uses whole-number scaling when upscaling or explicitly scaled', () => {
  assert.deepEqual(computeLuniDisplayDimensions(60, 80, { scale: 2 }), { width: 120, height: 160 });
  assert.deepEqual(computeLuniDisplayDimensions(40, 50, { size: 148 }), { width: 80, height: 100 });
  assert.deepEqual(computeLuniDisplayDimensions(165, 221, { size: 148 }), { width: 110, height: 148 });
});

test('LUNI_POSES config defines idle, wave, wink, wand, happy and the state poses with expected modes, timings, and assets', () => {
  assert.deepEqual(
    LUNI_POSES.map((p) => p.id),
    ['idle', 'wave', 'wink', 'wand', 'happy', 'listening', 'thinking', 'speaking', 'sleeping', 'waking'],
  );

  const idle = LUNI_POSES.find((p) => p.id === 'idle');
  assert.ok(idle);
  assert.equal(idle.mode, 'loop');
  assert.equal(idle.state, true);
  assert.equal(idle.cols, 3);
  assert.equal(idle.rows, 2);
  assert.equal(idle.frames, 6);
  assert.equal(idle.cleanWhiteBg, true);
  assert.ok(idle.fps >= 6 && idle.fps <= 8);
  const idleDiskPath = path.join(process.cwd(), 'public', idle.src.replace(/^\/+/, ''));
  assert.ok(fs.existsSync(idleDiskPath), `${idle.src} must exist in public/`);

  const wand = LUNI_POSES.find((p) => p.id === 'wand');
  assert.ok(wand);
  assert.equal(wand.frames, 6);
  assert.equal(wand.fps, 10);
  assert.equal(wand.mode, 'once');
  assert.equal(wand.effect, 'castSparkles');
  assert.equal(wand.effectFrame, 4);
  assert.equal(getPoseDurationMs(wand), 600);
  assert.equal(getPoseEffectDelayMs(wand), 300);
  assert.ok(typeof wand.tipX === 'number' && wand.tipX > 50 && wand.tipX <= 100);
  assert.ok(typeof wand.tipY === 'number' && wand.tipY > 0 && wand.tipY <= 100);

  const happy = LUNI_POSES.find((p) => p.id === 'happy');
  assert.ok(happy);
  assert.equal(happy.src, '/assets/pictures/luni_happy_v2.png');
  assert.equal(happy.frames, 6);
  assert.equal(happy.fps, 10);
  assert.equal(happy.mode, 'once');
  assert.equal(happy.bounce, true);
  assert.deepEqual(happy.bounceFrames, [3, 4, 5]);
  assert.equal(getPoseDurationMs(happy), 600);

  for (const stateId of ['listening', 'thinking', 'speaking', 'sleeping'] as const) {
    const pose = LUNI_POSES.find((p) => p.id === stateId);
    assert.ok(pose, `${stateId} pose must exist`);
    assert.equal(pose.mode, 'loop');
    assert.equal(pose.state, true);
    assert.equal(pose.frames, 6);
    const diskPath = path.join(process.cwd(), 'public', pose.src.replace(/^\/+/, ''));
    assert.ok(fs.existsSync(diskPath), `${pose.src} must exist in public/assets/pictures`);
  }

  const waking = LUNI_POSES.find((p) => p.id === 'waking');
  assert.ok(waking);
  assert.equal(waking.mode, 'once');
  assert.equal(waking.state, true);
  assert.equal(waking.optional, true);

  assert.deepEqual(
    getRandomTapLuniPoses(LUNI_POSES).map((p) => p.id),
    ['wave', 'wink', 'wand', 'happy'],
  );

  const diskPath = path.join(process.cwd(), 'public', happy.src.replace(/^\/+/, ''));
  assert.ok(fs.existsSync(diskPath), 'luni_happy_v2.png must exist in public/assets/pictures');
});

test('getLuniBounceMetrics calculates whole-pixel 6-8% jump offsets and respects prefersReducedMotion', () => {
  const happy = LUNI_POSES.find((p) => p.id === 'happy')!;
  const wave = LUNI_POSES.find((p) => p.id === 'wave')!;

  const metrics136 = getLuniBounceMetrics(happy, 136, false);
  assert.equal(metrics136.enabled, true);
  assert.equal(Number.isInteger(metrics136.peakOffsetPx), true);
  assert.equal(Number.isInteger(metrics136.halfOffsetPx), true);
  assert.ok(metrics136.peakOffsetPx < 0);
  const ratio = Math.abs(metrics136.peakOffsetPx) / 136;
  assert.ok(ratio >= 0.06 && ratio <= 0.08, `Expected 6-8% bounce height, got ${ratio}`);
  assert.deepEqual(metrics136.bounceFrames, [3, 4, 5]);

  const reduced = getLuniBounceMetrics(happy, 136, true);
  assert.equal(reduced.enabled, false);
  assert.equal(reduced.peakOffsetPx, 0);
  assert.equal(reduced.halfOffsetPx, 0);

  const nonBouncing = getLuniBounceMetrics(wave, 136, false);
  assert.equal(nonBouncing.enabled, false);
  assert.equal(nonBouncing.peakOffsetPx, 0);
});

test('pickRandomLuniPose covers all 4 poses and never picks the same pose twice in a row', () => {
  let prev: string | null = null;
  let state = 1337;
  const pseudoRng = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };

  const seen = new Set<string>();
  for (let i = 0; i < 160; i++) {
    const picked: (typeof LUNI_POSES)[number] = pickRandomLuniPose(LUNI_POSES, prev, pseudoRng);
    assert.notEqual(picked.id, prev);
    seen.add(picked.id);
    prev = picked.id;
  }

  assert.deepEqual([...seen].sort(), ['happy', 'wand', 'wave', 'wink']);

  // Edge boundary rolls (0.0 and 0.9999) when lastPoseId is each of the 4 poses
  for (const last of ['wave', 'wink', 'wand', 'happy']) {
    assert.notEqual(pickRandomLuniPose(LUNI_POSES, last, () => 0).id, last);
    assert.notEqual(pickRandomLuniPose(LUNI_POSES, last, () => 0.9999).id, last);
  }
});

test('login greeting ALWAYS uses wave pose specifically (never random)', () => {
  for (let i = 0; i < 10; i++) {
    assert.equal(getLuniLoginGreetPoseId(), 'wave');
  }
});

test('computeUnifiedPoseCropPlans computes one shared bounding box and baseline across all 4 pose sheets', () => {
  const paintSheetFrame = (fw: number, fh: number, minX: number, maxX: number, minY: number, maxY: number) => {
    const buf = new Uint8ClampedArray(fw * fh * 4);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = (y * fw + x) * 4;
        buf[p] = 80;
        buf[p + 1] = 120;
        buf[p + 2] = 240;
        buf[p + 3] = 255;
      }
    }
    return buf;
  };

  const result = computeUnifiedPoseCropPlans([
    {
      id: 'wave',
      rawFrameWidth: 20,
      rawFrameHeight: 24,
      frameBuffers: [paintSheetFrame(20, 24, 5, 13, 4, 21)], // hood anchor = 9, w=9, h=18
    },
    {
      id: 'wink',
      rawFrameWidth: 20,
      rawFrameHeight: 24,
      frameBuffers: [paintSheetFrame(20, 24, 5, 13, 5, 21)], // h=17
    },
    {
      id: 'wand',
      rawFrameWidth: 26,
      rawFrameHeight: 28,
      frameBuffers: [paintSheetFrame(26, 28, 7, 21, 6, 20)], // hood anchor = 14, leftExt=7, rightExt=7, w=15, h=15
    },
    {
      id: 'happy',
      rawFrameWidth: 22,
      rawFrameHeight: 24,
      frameBuffers: [paintSheetFrame(22, 24, 5, 15, 5, 20)], // h=16
    },
  ]);

  assert.equal(result.cropWidth, 15);
  assert.equal(result.cropHeight, 18);
  assert.equal(result.baselineY, 17);

  for (const id of ['wave', 'wink', 'wand', 'happy']) {
    const placement = result.sheets[id].placements[0];
    assert.equal(result.sheets[id].cropWidth, result.cropWidth);
    assert.equal(result.sheets[id].cropHeight, result.cropHeight);
    assert.equal(placement.destY + placement.srcHeight - 1, result.baselineY);
  }
});

test('dynamic sheet scale normalization matches large grid idle sheet to existing pose sheets without hardcoded sizes', () => {
  const paintFrame = (fw: number, fh: number, minX: number, maxX: number, minY: number, maxY: number) => {
    const buf = new Uint8ClampedArray(fw * fh * 4);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = (y * fw + x) * 4;
        buf[p] = 120;
        buf[p + 1] = 150;
        buf[p + 2] = 250;
        buf[p + 3] = 255;
      }
    }
    return buf;
  };

  const idleBodyHeight = measureSheetMedianBodyHeight([paintFrame(100, 120, 20, 79, 10, 109)], 100, 120);
  const waveBodyHeight = measureSheetMedianBodyHeight([paintFrame(40, 50, 10, 29, 8, 32)], 40, 50);
  const speakBodyHeight = measureSheetMedianBodyHeight([paintFrame(40, 50, 10, 29, 7, 32)], 40, 50);

  assert.equal(idleBodyHeight, 100);
  assert.equal(waveBodyHeight, 25);

  const refH = computeReferenceBodyHeight([idleBodyHeight, waveBodyHeight, speakBodyHeight]);
  assert.equal(refH, 26);

  // Within 12% tolerance stays unscaled (1); significantly larger sheet (idle 100px vs 26px ref) scales to match
  assert.equal(computeNormalizedSheetScale(waveBodyHeight, refH), 1);
  assert.equal(computeNormalizedSheetScale(idleBodyHeight, refH), 26 / 100);
});
