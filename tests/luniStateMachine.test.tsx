import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { INITIAL_STATE, StudentProvider } from '../src/context/StudentContext';
import { STUDENT_STORAGE_KEY } from '../src/utils/achievementStorage';
import { CommunityProvider } from '../src/context/CommunityContext';
import { LuniStateProvider } from '../src/context/LuniStateContext';
import { LuniAssistantWidget } from '../src/components/luni/LuniAssistantWidget';
import { LuniAssistantPanel } from '../src/components/luni/LuniAssistantPanel';
import {
  LUNI_POSES,
  getLuniPoseById,
  getRandomTapLuniPoses,
  isStateLuniPose,
  pickRandomLuniPose,
} from '../src/data/luniSpritePoses';
import {
  LUNI_SLEEP_MS,
  LUNI_SPEAK_MAX_MS,
  LUNI_SPEAK_MIN_MS,
  LUNI_SPEAK_MS_PER_WORD,
  LUNI_SPEAK_STREAM_TAIL_MS,
  LUNI_TYPING_IDLE_TIMEOUT_MS,
  computeSpeakDurationMs,
  computeStreamTailDurationMs,
  createInitialLuniMachineState,
  getOverlayStateForMachine,
  getTargetPoseIdForMachine,
  isLoopPoseId,
  luniStateReducer,
} from '../src/utils/luniStateMachine';

test('computeSpeakDurationMs clamps 1, 20, and 200 words accurately with named constants', () => {
  assert.equal(LUNI_SPEAK_MS_PER_WORD, 350);
  assert.equal(LUNI_SPEAK_MIN_MS, 1500);
  assert.equal(LUNI_SPEAK_MAX_MS, 12000);
  assert.equal(LUNI_SPEAK_STREAM_TAIL_MS, 400);
  assert.equal(LUNI_TYPING_IDLE_TIMEOUT_MS, 2500);
  assert.equal(LUNI_SLEEP_MS, 30000);

  assert.equal(computeSpeakDurationMs(''), 1500);
  assert.equal(computeSpeakDurationMs('hello'), 1500);

  const twentyWords = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
  assert.equal(computeSpeakDurationMs(twentyWords), 7000);

  const twoHundredWords = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ');
  assert.equal(computeSpeakDurationMs(twoHundredWords), 12000);
});

test('computeStreamTailDurationMs handles short vs long streams per spec', () => {
  const twentyWords = Array.from({ length: 20 }, (_, i) => `w${i}`).join(' ');
  // Stream starts at 1000 and ends at 1200 (< 1500ms min elapsed): remaining brings total to 7000ms (remaining = 6800ms)
  assert.equal(computeStreamTailDurationMs(twentyWords, 1000, 1200), 6800);

  // Stream starts at 1000 and ends at 4000 (>= 1500ms elapsed): returns 400ms tail
  assert.equal(computeStreamTailDurationMs(twentyWords, 1000, 4000), 400);
});

test('reducer handles greeting on first chat open, typing, send -> thinking -> speaking -> idle, and error', () => {
  let ctx = createInitialLuniMachineState(false);

  // First chat open plays greeting ('wave' once) and marks session greeted
  ctx = luniStateReducer(ctx, { type: 'CHAT_OPENED' });
  assert.equal(ctx.state, 'greeting');
  assert.equal(ctx.hasGreetedThisSession, true);
  assert.equal(getTargetPoseIdForMachine(ctx), 'wave');

  // If user starts typing while greeting is playing, greeting finishes first then switches to listening
  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'hello', now: 100 });
  assert.equal(ctx.state, 'greeting');
  assert.equal(ctx.isTyping, true);

  ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: 600 });
  assert.equal(ctx.state, 'listening');

  // Second chat open in same session does NOT replay greeting
  ctx = luniStateReducer(ctx, { type: 'INPUT_BLUR' });
  assert.equal(ctx.state, 'idle');
  ctx = luniStateReducer(ctx, { type: 'CHAT_OPENED' });
  assert.equal(ctx.state, 'idle');

  // Send message -> thinking -> reply arrives -> speaking -> speak done -> idle
  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'Which track?', now: 700 });
  assert.equal(ctx.state, 'listening');

  ctx = luniStateReducer(ctx, { type: 'MESSAGE_SENT', now: 800 });
  assert.equal(ctx.state, 'thinking');
  assert.equal(ctx.isTyping, false);
  assert.equal(getOverlayStateForMachine(ctx), 'thinking');

  ctx = luniStateReducer(ctx, { type: 'REPLY_DONE', reply: 'Try Networking Technology!', now: 1200 });
  assert.equal(ctx.state, 'speaking');
  assert.equal(ctx.speakDurationMs, 1500);
  assert.equal(getOverlayStateForMachine(ctx), 'speaking');

  ctx = luniStateReducer(ctx, { type: 'SPEAK_DONE' });
  assert.equal(ctx.state, 'idle');
  assert.equal(getOverlayStateForMachine(ctx), null);

  // Error during thinking returns to idle without speaking
  ctx = luniStateReducer(ctx, { type: 'MESSAGE_SENT', now: 2000 });
  assert.equal(ctx.state, 'thinking');
  ctx = luniStateReducer(ctx, { type: 'ERROR' });
  assert.equal(ctx.state, 'idle');
  assert.equal(ctx.speakDurationMs, null);
});

test('reducer supports streamed replies and never sleeps during thinking, speaking, or typing', () => {
  let ctx = createInitialLuniMachineState(true);

  // Typing prevents sleep
  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'hi', now: 100 });
  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  assert.equal(ctx.state, 'listening');

  // Thinking prevents sleep
  ctx = luniStateReducer(ctx, { type: 'MESSAGE_SENT', now: 200 });
  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  assert.equal(ctx.state, 'thinking');

  // Streaming starts speaking at first chunk and continues on chunks
  ctx = luniStateReducer(ctx, { type: 'REPLY_STARTED', now: 500 });
  assert.equal(ctx.state, 'speaking');
  assert.equal(ctx.isStreamingReply, true);

  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  assert.equal(ctx.state, 'speaking');

  // Typing during speaking queues listening for next loop boundary
  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'follow up', now: 1000 });
  assert.equal(ctx.state, 'speaking');
  ctx = luniStateReducer(ctx, { type: 'LOOP_BOUNDARY' });
  assert.equal(ctx.state, 'listening');
});

test('sleeping wakes on activity (with missing waking-sheet fallback to idle + ! overlay) and restores listening if typing', () => {
  let ctx = createInitialLuniMachineState(true);

  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  assert.equal(ctx.state, 'sleeping');
  assert.equal(getOverlayStateForMachine(ctx), 'sleeping');

  // Activity while sleeping -> waking with 400ms `!` overlay
  ctx = luniStateReducer(ctx, { type: 'ACTIVITY' });
  assert.equal(ctx.state, 'waking');
  assert.equal(ctx.wakingBangActive, true);
  assert.equal(getOverlayStateForMachine(ctx), 'waking');
  // When waking sheet exists -> 'waking', when missing -> falls back to 'idle' with `!` overlay
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'waking');
  assert.equal(getTargetPoseIdForMachine(ctx, false), 'idle');

  ctx = luniStateReducer(ctx, { type: 'WAKING_BANG_DONE' });
  assert.equal(ctx.wakingBangActive, false);
  assert.equal(getOverlayStateForMachine(ctx), null);

  ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: 1000 });
  assert.equal(ctx.state, 'idle');
});

test('tap starts random pose ONLY when idle, wakes when sleeping, and never picks state poses', () => {
  const tapPoses = getRandomTapLuniPoses(LUNI_POSES);
  assert.deepEqual(
    tapPoses.map((p) => p.id),
    ['wave', 'wink', 'wand', 'happy'],
  );

  for (let i = 0; i < 40; i++) {
    const picked = pickRandomLuniPose(LUNI_POSES, null, () => (i % 10) / 10);
    assert.equal(isStateLuniPose(picked), false);
  }

  let ctx = createInitialLuniMachineState(true);

  // Idle tap starts once-pose
  ctx = luniStateReducer(ctx, { type: 'TAP', poseId: 'wand' });
  assert.equal(ctx.state, 'idle');
  assert.equal(ctx.activeTapPose, 'wand');

  // Cannot cut off in-flight tap pose with message sent; queues thinking until once-pose ends
  ctx = luniStateReducer(ctx, { type: 'MESSAGE_SENT', now: 200 });
  assert.equal(ctx.activeTapPose, 'wand');
  ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: 600 });
  assert.equal(ctx.activeTapPose, null);
  assert.equal(ctx.state, 'thinking');

  // Tap during thinking does NOT start a random pose
  ctx = luniStateReducer(ctx, { type: 'TAP', poseId: 'happy' });
  assert.equal(ctx.activeTapPose, null);
  assert.equal(ctx.state, 'thinking');

  // Tap while sleeping wakes Luni
  ctx = luniStateReducer(ctx, { type: 'ERROR' });
  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  assert.equal(ctx.state, 'sleeping');
  ctx = luniStateReducer(ctx, { type: 'TAP', poseId: 'wave' });
  assert.equal(ctx.state, 'waking');
  assert.equal(ctx.activeTapPose, null);
});

test('LuniAssistantWidget and LuniAssistantPanel share ONE state via LuniStateProvider', () => {
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <CommunityProvider>
            <LuniStateProvider>
              <LuniAssistantWidget />
              <LuniAssistantPanel isOpen={true} onClose={() => {}} />
            </LuniStateProvider>
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );

    const widgetMatch = html.match(/data-testid="luni-assistant-widget-button"[^>]*data-luni-state="([^"]+)"/);
    const panelMatch = html.match(/data-testid="luni-panel-avatar"[^>]*data-luni-state="([^"]+)"/);
    assert.ok(widgetMatch, 'Widget button renders data-luni-state');
    assert.ok(panelMatch, 'Panel avatar renders data-luni-state');
    assert.equal(widgetMatch[1], panelMatch[1]);
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }
});

test('fake timers validate 2500ms typing timeout and 30000ms sleep timeout + wake flow', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  let ctx = createInitialLuniMachineState(true);
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const scheduleTypingTimeout = () => {
    if (timerId !== null) clearTimeout(timerId);
    timerId = setTimeout(() => {
      ctx = luniStateReducer(ctx, { type: 'TYPING_TIMEOUT' });
    }, LUNI_TYPING_IDLE_TIMEOUT_MS);
  };

  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'BSIT', now: Date.now() });
  assert.equal(ctx.state, 'listening');
  scheduleTypingTimeout();

  t.mock.timers.tick(2400);
  assert.equal(ctx.state, 'listening');

  t.mock.timers.tick(150);
  assert.equal(ctx.state, 'idle');

  // Schedule 30s sleep timer from idle
  const sleepTimer = setTimeout(() => {
    ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  }, LUNI_SLEEP_MS);

  t.mock.timers.tick(29900);
  assert.equal(ctx.state, 'idle');

  t.mock.timers.tick(200);
  assert.equal(ctx.state, 'sleeping');
  clearTimeout(sleepTimer);

  // Activity wakes Luni -> waking (400ms bang) -> once pose ends -> idle
  ctx = luniStateReducer(ctx, { type: 'ACTIVITY' });
  assert.equal(ctx.state, 'waking');
  assert.equal(ctx.wakingBangActive, true);
  ctx = luniStateReducer(ctx, { type: 'WAKING_BANG_DONE' });
  assert.equal(ctx.wakingBangActive, false);
  ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: Date.now() });
  assert.equal(ctx.state, 'idle');
});

test('idle loop default, sleep isolation, waking->idle resume, post-pose return, and random-tap pool exclusion (fake timers)', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

  // 1. Initial state is idle and the idle pose is mode 'loop'
  let ctx = createInitialLuniMachineState(true);
  const idlePose = getLuniPoseById('idle');
  assert.ok(idlePose);
  assert.equal(ctx.state, 'idle');
  assert.equal(idlePose.mode, 'loop');
  assert.equal(idlePose.state, true);
  assert.equal(isLoopPoseId('idle'), true);
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'idle');

  // Verify initial SSR markup in both LuniAssistantWidget and LuniAssistantPanel defaults to looping idle
  const previousStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const store = new Map<string, string>();
  (globalThis as { localStorage?: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  try {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <CommunityProvider>
            <LuniStateProvider>
              <LuniAssistantWidget />
              <LuniAssistantPanel isOpen={true} onClose={() => {}} />
            </LuniStateProvider>
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );

    const spriteMatches = [...html.matchAll(/data-testid="luni-wave-sprite"[^>]*data-sprite-pose="([^"]+)"[^>]*data-wave-playing="([^"]+)"[^>]*data-animation-paused="([^"]+)"[^>]*data-playback-mode="([^"]+)"/g)];
    assert.equal(spriteMatches.length, 2);
    for (const m of spriteMatches) {
      assert.equal(m[1], 'idle');
      assert.equal(m[2], 'true');
      assert.equal(m[3], 'false');
      assert.equal(m[4], 'loop');
    }

    // Reduced motion renders static first frame (no loop)
    store.set(
      STUDENT_STORAGE_KEY,
      JSON.stringify({
        ...INITIAL_STATE,
        preferences: { ...INITIAL_STATE.preferences, reducedMotion: true },
      }),
    );
    const reducedHtml = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <CommunityProvider>
            <LuniStateProvider>
              <LuniAssistantWidget />
              <LuniAssistantPanel isOpen={true} onClose={() => {}} />
            </LuniStateProvider>
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );
    const reducedMatches = [...reducedHtml.matchAll(/data-testid="luni-wave-sprite"[^>]*data-sprite-pose="([^"]+)"[^>]*data-wave-playing="([^"]+)"/g)];
    assert.equal(reducedMatches.length, 2);
    for (const m of reducedMatches) {
      assert.equal(m[1], 'idle');
      assert.equal(m[2], 'false');
    }

    // luniEnabled: false suppresses widget and keeps panel on static first idle frame
    store.set(
      STUDENT_STORAGE_KEY,
      JSON.stringify({
        ...INITIAL_STATE,
        preferences: { ...INITIAL_STATE.preferences, luniEnabled: false },
      }),
    );
    const disabledHtml = renderToStaticMarkup(
      <MemoryRouter>
        <StudentProvider>
          <CommunityProvider>
            <LuniStateProvider>
              <LuniAssistantWidget />
              <LuniAssistantPanel isOpen={true} onClose={() => {}} />
            </LuniStateProvider>
          </CommunityProvider>
        </StudentProvider>
      </MemoryRouter>,
    );
    assert.equal(disabledHtml.includes('data-testid="luni-assistant-widget-button"'), false);
    const disabledSprite = disabledHtml.match(/data-testid="luni-wave-sprite"[^>]*data-sprite-pose="([^"]+)"[^>]*data-wave-playing="([^"]+)"/);
    assert.ok(disabledSprite);
    assert.equal(disabledSprite[1], 'idle');
    assert.equal(disabledSprite[2], 'false');
  } finally {
    if (previousStorage === undefined) {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    } else {
      (globalThis as { localStorage?: Storage }).localStorage = previousStorage;
    }
  }

  // 2. idle -> sleeping after LUNI_SLEEP_MS stops idle loop and switches target pose strictly to sleeping
  const sleepTimer = setTimeout(() => {
    ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  }, LUNI_SLEEP_MS);
  t.mock.timers.tick(LUNI_SLEEP_MS);
  clearTimeout(sleepTimer);

  assert.equal(ctx.state, 'sleeping');
  assert.notEqual(getTargetPoseIdForMachine(ctx, true), 'idle');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'sleeping');

  // 3. sleeping -> waking -> idle resumes the idle loop (or listening when typing, then idle loop)
  ctx = luniStateReducer(ctx, { type: 'ACTIVITY' });
  assert.equal(ctx.state, 'waking');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'waking');
  const wakeTimer = setTimeout(() => {
    ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: Date.now() });
  }, 600);
  t.mock.timers.tick(600);
  clearTimeout(wakeTimer);
  assert.equal(ctx.state, 'idle');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'idle');

  // Wake while typing -> listening -> typing timeout -> returns to idle loop
  ctx = luniStateReducer(ctx, { type: 'SLEEP_TIMEOUT' });
  ctx = luniStateReducer(ctx, { type: 'TYPING', text: 'hello', now: Date.now() });
  assert.equal(ctx.state, 'waking');
  ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: Date.now() });
  assert.equal(ctx.state, 'listening');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'listening');
  ctx = luniStateReducer(ctx, { type: 'TYPING_TIMEOUT' });
  assert.equal(ctx.state, 'idle');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'idle');

  // 4. After thinking, speaking, and random once-poses (wave, wink, wand, happy), returns to idle loop
  ctx = luniStateReducer(ctx, { type: 'MESSAGE_SENT', now: Date.now() });
  assert.equal(ctx.state, 'thinking');
  ctx = luniStateReducer(ctx, { type: 'REPLY_DONE', reply: 'Short reply.', now: Date.now() });
  assert.equal(ctx.state, 'speaking');
  const speakTimer = setTimeout(() => {
    ctx = luniStateReducer(ctx, { type: 'SPEAK_DONE' });
  }, ctx.speakDurationMs ?? LUNI_SPEAK_MIN_MS);
  t.mock.timers.tick(ctx.speakDurationMs ?? LUNI_SPEAK_MIN_MS);
  clearTimeout(speakTimer);
  assert.equal(ctx.state, 'idle');
  assert.equal(getTargetPoseIdForMachine(ctx, true), 'idle');

  for (const poseId of ['wave', 'wink', 'wand', 'happy'] as const) {
    ctx = luniStateReducer(ctx, { type: 'TAP', poseId });
    assert.equal(ctx.activeTapPose, poseId);
    assert.equal(getTargetPoseIdForMachine(ctx, true), poseId);
    const onceTimer = setTimeout(() => {
      ctx = luniStateReducer(ctx, { type: 'ONCE_POSE_ENDED', now: Date.now() });
    }, 600);
    t.mock.timers.tick(600);
    clearTimeout(onceTimer);
    assert.equal(ctx.state, 'idle');
    assert.equal(ctx.activeTapPose, null);
    assert.equal(getTargetPoseIdForMachine(ctx, true), 'idle');
  }

  // 5. idle is NOT part of the random-tap pool
  const randomPool = getRandomTapLuniPoses(LUNI_POSES);
  assert.equal(randomPool.some((p) => p.id === 'idle'), false);
  for (let i = 0; i < 60; i++) {
    const picked = pickRandomLuniPose(LUNI_POSES, null, () => (i % 100) / 100);
    assert.notEqual(picked.id, 'idle');
  }
});
