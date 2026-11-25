export const LUNI_SPEAK_MS_PER_WORD = 350;
export const LUNI_SPEAK_MIN_MS = 1500;
export const LUNI_SPEAK_MAX_MS = 12000;
export const LUNI_SPEAK_STREAM_TAIL_MS = 400;
export const LUNI_TYPING_IDLE_TIMEOUT_MS = 2500;
export const LUNI_SLEEP_MS = 30000;
export const LUNI_ACTIVITY_THROTTLE_MS = 250;
export const LUNI_WAKING_BANG_MS = 400;
export const LUNI_CHAT_GREETED_SESSION_KEY = 'ctrl_path_luni_chat_greeted_v1';

export type LuniMachineStateName =
  | 'idle'
  | 'greeting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'sleeping'
  | 'waking';

export type LuniOverlayState = 'thinking' | 'speaking' | 'sleeping' | 'waking' | null;

export interface LuniMachineContext {
  state: LuniMachineStateName;
  activeTapPose: string | null;
  queuedState: LuniMachineStateName | null;
  queuedSpeakDurationMs: number | null;
  isTyping: boolean;
  hasGreetedThisSession: boolean;
  isStreamingReply: boolean;
  streamStartedAt: number | null;
  speakDurationMs: number | null;
  speakStartedAt: number | null;
  lastTapPoseId: string | null;
  wakingBangActive: boolean;
}

export type LuniMachineAction =
  | { type: 'CHAT_OPENED' }
  | { type: 'TYPING'; text: string; now: number }
  | { type: 'INPUT_BLUR' }
  | { type: 'TYPING_TIMEOUT' }
  | { type: 'MESSAGE_SENT'; now: number }
  | { type: 'REPLY_STARTED'; now: number }
  | { type: 'REPLY_CHUNK'; now: number }
  | { type: 'REPLY_DONE'; reply: string; now: number }
  | { type: 'SPEAK_DONE' }
  | { type: 'LOOP_BOUNDARY' }
  | { type: 'ERROR' }
  | { type: 'SLEEP_TIMEOUT' }
  | { type: 'ACTIVITY' }
  | { type: 'WAKING_BANG_DONE' }
  | { type: 'ONCE_POSE_ENDED'; now: number }
  | { type: 'TAP'; poseId: string | null }
  | { type: 'TRIGGER_SPECIFIC_TAP'; poseId: string }
  | { type: 'RESET_DISABLED' };

export function countReplyWords(reply: string): number {
  const trimmed = reply.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function computeSpeakDurationMs(reply: string): number {
  const words = countReplyWords(reply);
  const rawMs = words * LUNI_SPEAK_MS_PER_WORD;
  return Math.min(LUNI_SPEAK_MAX_MS, Math.max(LUNI_SPEAK_MIN_MS, rawMs));
}

export function computeStreamTailDurationMs(
  reply: string,
  streamStartedAt: number | null,
  now: number,
): number {
  const wordDurationMs = computeSpeakDurationMs(reply);
  if (streamStartedAt === null) {
    return wordDurationMs;
  }
  const elapsedMs = Math.max(0, now - streamStartedAt);
  if (elapsedMs < LUNI_SPEAK_MIN_MS) {
    return Math.max(LUNI_SPEAK_STREAM_TAIL_MS, wordDurationMs - elapsedMs);
  }
  return LUNI_SPEAK_STREAM_TAIL_MS;
}

export function createInitialLuniMachineState(
  hasGreetedThisSession = false,
): LuniMachineContext {
  return {
    state: 'idle',
    activeTapPose: null,
    queuedState: null,
    queuedSpeakDurationMs: null,
    isTyping: false,
    hasGreetedThisSession,
    isStreamingReply: false,
    streamStartedAt: null,
    speakDurationMs: null,
    speakStartedAt: null,
    lastTapPoseId: null,
    wakingBangActive: false,
  };
}

export function isOncePoseInFlight(ctx: Pick<LuniMachineContext, 'state' | 'activeTapPose'>): boolean {
  return ctx.activeTapPose !== null || ctx.state === 'greeting' || ctx.state === 'waking';
}

export function resolveRestState(ctx: Pick<LuniMachineContext, 'isTyping'>): 'idle' | 'listening' {
  return ctx.isTyping ? 'listening' : 'idle';
}

export function luniStateReducer(
  ctx: LuniMachineContext,
  action: LuniMachineAction,
): LuniMachineContext {
  switch (action.type) {
    case 'RESET_DISABLED': {
      return {
        ...ctx,
        state: 'idle',
        activeTapPose: null,
        queuedState: null,
        queuedSpeakDurationMs: null,
        isTyping: false,
        isStreamingReply: false,
        streamStartedAt: null,
        speakDurationMs: null,
        speakStartedAt: null,
        wakingBangActive: false,
      };
    }

    case 'CHAT_OPENED': {
      if (!ctx.hasGreetedThisSession) {
        if (ctx.state === 'thinking' || ctx.state === 'speaking') {
          return {
            ...ctx,
            hasGreetedThisSession: true,
          };
        }
        if (ctx.activeTapPose !== null) {
          return {
            ...ctx,
            hasGreetedThisSession: true,
            queuedState: 'greeting',
          };
        }
        return {
          ...ctx,
          state: 'greeting',
          hasGreetedThisSession: true,
          queuedState: ctx.isTyping ? 'listening' : null,
          wakingBangActive: false,
        };
      }

      if (ctx.state === 'sleeping') {
        return {
          ...ctx,
          state: 'waking',
          wakingBangActive: true,
          queuedState: ctx.isTyping ? 'listening' : null,
        };
      }
      return ctx;
    }

    case 'TYPING': {
      const nonEmpty = action.text.trim().length > 0;
      if (nonEmpty) {
        if (ctx.state === 'thinking') {
          return {
            ...ctx,
            isTyping: true,
          };
        }
        if (ctx.state === 'speaking') {
          return {
            ...ctx,
            isTyping: true,
            queuedState: 'listening',
          };
        }
        if (isOncePoseInFlight(ctx)) {
          return {
            ...ctx,
            isTyping: true,
            queuedState:
              ctx.queuedState === 'thinking' || ctx.queuedState === 'speaking'
                ? ctx.queuedState
                : 'listening',
          };
        }
        if (ctx.state === 'sleeping') {
          return {
            ...ctx,
            state: 'waking',
            isTyping: true,
            wakingBangActive: true,
            queuedState: 'listening',
          };
        }
        if (ctx.state === 'listening' && ctx.isTyping) {
          return ctx;
        }
        return {
          ...ctx,
          state: 'listening',
          isTyping: true,
          queuedState: null,
        };
      }

      // Empty input
      if (!ctx.isTyping && ctx.state !== 'listening' && ctx.queuedState !== 'listening') {
        return ctx;
      }
      return {
        ...ctx,
        isTyping: false,
        state: ctx.state === 'listening' ? 'idle' : ctx.state,
        queuedState: ctx.queuedState === 'listening' ? null : ctx.queuedState,
      };
    }

    case 'INPUT_BLUR':
    case 'TYPING_TIMEOUT': {
      if (!ctx.isTyping && ctx.state !== 'listening' && ctx.queuedState !== 'listening') {
        return ctx;
      }
      return {
        ...ctx,
        isTyping: false,
        state: ctx.state === 'listening' ? 'idle' : ctx.state,
        queuedState: ctx.queuedState === 'listening' ? null : ctx.queuedState,
      };
    }

    case 'MESSAGE_SENT': {
      if (isOncePoseInFlight(ctx)) {
        return {
          ...ctx,
          isTyping: false,
          queuedState: 'thinking',
          queuedSpeakDurationMs: null,
          isStreamingReply: false,
          streamStartedAt: null,
          speakDurationMs: null,
          speakStartedAt: null,
        };
      }
      return {
        ...ctx,
        state: 'thinking',
        activeTapPose: null,
        queuedState: null,
        queuedSpeakDurationMs: null,
        isTyping: false,
        isStreamingReply: false,
        streamStartedAt: null,
        speakDurationMs: null,
        speakStartedAt: null,
        wakingBangActive: false,
      };
    }

    case 'REPLY_STARTED':
    case 'REPLY_CHUNK': {
      if (ctx.isStreamingReply) {
        return ctx;
      }
      if (isOncePoseInFlight(ctx)) {
        return {
          ...ctx,
          isStreamingReply: true,
          streamStartedAt: action.now,
          queuedState: 'speaking',
          queuedSpeakDurationMs: null,
        };
      }
      return {
        ...ctx,
        state: 'speaking',
        queuedState: null,
        queuedSpeakDurationMs: null,
        isStreamingReply: true,
        streamStartedAt: action.now,
        speakStartedAt: action.now,
        speakDurationMs: null,
        wakingBangActive: false,
      };
    }

    case 'REPLY_DONE': {
      const durationMs = ctx.isStreamingReply
        ? computeStreamTailDurationMs(action.reply, ctx.streamStartedAt, action.now)
        : computeSpeakDurationMs(action.reply);

      if (isOncePoseInFlight(ctx)) {
        return {
          ...ctx,
          isStreamingReply: false,
          streamStartedAt: null,
          queuedState: 'speaking',
          queuedSpeakDurationMs: durationMs,
        };
      }

      return {
        ...ctx,
        state: 'speaking',
        isStreamingReply: false,
        streamStartedAt: null,
        speakDurationMs: durationMs,
        speakStartedAt: action.now,
        queuedState: ctx.isTyping ? 'listening' : null,
        queuedSpeakDurationMs: null,
        wakingBangActive: false,
      };
    }

    case 'SPEAK_DONE': {
      if (ctx.state !== 'speaking' || ctx.isStreamingReply) {
        return ctx;
      }
      return {
        ...ctx,
        state: resolveRestState(ctx),
        queuedState: null,
        queuedSpeakDurationMs: null,
        isStreamingReply: false,
        streamStartedAt: null,
        speakDurationMs: null,
        speakStartedAt: null,
      };
    }

    case 'LOOP_BOUNDARY': {
      if (ctx.state === 'speaking' && ctx.queuedState === 'listening') {
        return {
          ...ctx,
          state: 'listening',
          queuedState: null,
          queuedSpeakDurationMs: null,
          isStreamingReply: false,
          streamStartedAt: null,
          speakDurationMs: null,
          speakStartedAt: null,
        };
      }
      return ctx;
    }

    case 'ERROR': {
      if (isOncePoseInFlight(ctx)) {
        return {
          ...ctx,
          isStreamingReply: false,
          streamStartedAt: null,
          speakDurationMs: null,
          speakStartedAt: null,
          queuedSpeakDurationMs: null,
          queuedState:
            ctx.queuedState === 'thinking' || ctx.queuedState === 'speaking'
              ? null
              : ctx.queuedState,
        };
      }
      if (ctx.state === 'thinking' || ctx.state === 'speaking') {
        return {
          ...ctx,
          state: resolveRestState(ctx),
          queuedState: null,
          queuedSpeakDurationMs: null,
          isStreamingReply: false,
          streamStartedAt: null,
          speakDurationMs: null,
          speakStartedAt: null,
        };
      }
      return ctx;
    }

    case 'SLEEP_TIMEOUT': {
      if (ctx.state !== 'idle' || ctx.isTyping || ctx.activeTapPose !== null) {
        return ctx;
      }
      return {
        ...ctx,
        state: 'sleeping',
        queuedState: null,
        queuedSpeakDurationMs: null,
        wakingBangActive: false,
      };
    }

    case 'ACTIVITY': {
      if (ctx.state !== 'sleeping') {
        return ctx;
      }
      return {
        ...ctx,
        state: 'waking',
        wakingBangActive: true,
        queuedState: ctx.isTyping ? 'listening' : null,
      };
    }

    case 'WAKING_BANG_DONE': {
      if (!ctx.wakingBangActive) return ctx;
      return {
        ...ctx,
        wakingBangActive: false,
      };
    }

    case 'ONCE_POSE_ENDED': {
      if (!isOncePoseInFlight(ctx)) {
        return ctx;
      }

      const nextQueued = ctx.queuedState;
      const nextSpeakDuration = ctx.queuedSpeakDurationMs;

      if (nextQueued === 'thinking') {
        return {
          ...ctx,
          state: 'thinking',
          activeTapPose: null,
          queuedState: null,
          queuedSpeakDurationMs: null,
          wakingBangActive: false,
        };
      }

      if (nextQueued === 'speaking') {
        return {
          ...ctx,
          state: 'speaking',
          activeTapPose: null,
          queuedState: ctx.isTyping ? 'listening' : null,
          queuedSpeakDurationMs: null,
          speakDurationMs: nextSpeakDuration,
          speakStartedAt: action.now,
          wakingBangActive: false,
        };
      }

      if (nextQueued === 'greeting') {
        return {
          ...ctx,
          state: 'greeting',
          activeTapPose: null,
          queuedState: ctx.isTyping ? 'listening' : null,
          queuedSpeakDurationMs: null,
          wakingBangActive: false,
        };
      }

      return {
        ...ctx,
        state: nextQueued === 'listening' || ctx.isTyping ? 'listening' : 'idle',
        activeTapPose: null,
        queuedState: null,
        queuedSpeakDurationMs: null,
        wakingBangActive: false,
      };
    }

    case 'TAP': {
      if (ctx.state === 'sleeping') {
        return {
          ...ctx,
          state: 'waking',
          wakingBangActive: true,
          queuedState: ctx.isTyping ? 'listening' : null,
        };
      }
      if (ctx.state !== 'idle' || ctx.activeTapPose !== null || !action.poseId) {
        return ctx;
      }
      return {
        ...ctx,
        activeTapPose: action.poseId,
        lastTapPoseId: action.poseId,
      };
    }

    case 'TRIGGER_SPECIFIC_TAP': {
      if (ctx.state !== 'idle' || ctx.activeTapPose !== null) {
        return ctx;
      }
      return {
        ...ctx,
        activeTapPose: action.poseId,
        lastTapPoseId: action.poseId,
      };
    }

    default:
      return ctx;
  }
}

export function getTargetPoseIdForMachine(
  ctx: Pick<LuniMachineContext, 'state' | 'activeTapPose'>,
  wakingSheetAvailable = true,
): string {
  if (ctx.activeTapPose) {
    return ctx.activeTapPose;
  }
  if (ctx.state === 'greeting') {
    return 'wave';
  }
  if (ctx.state === 'waking') {
    return wakingSheetAvailable ? 'waking' : 'idle';
  }
  return ctx.state;
}

export function getOverlayStateForMachine(
  ctx: Pick<LuniMachineContext, 'state' | 'activeTapPose' | 'wakingBangActive'>,
): LuniOverlayState {
  if (ctx.activeTapPose !== null) {
    return null;
  }
  if (ctx.state === 'waking') {
    return ctx.wakingBangActive ? 'waking' : null;
  }
  if (ctx.state === 'thinking' || ctx.state === 'speaking' || ctx.state === 'sleeping') {
    return ctx.state;
  }
  return null;
}

export function isLoopPoseId(poseId: string): boolean {
  return (
    poseId === 'idle' ||
    poseId === 'listening' ||
    poseId === 'thinking' ||
    poseId === 'speaking' ||
    poseId === 'sleeping'
  );
}

export function isOncePoseId(poseId: string): boolean {
  return (
    poseId === 'wave' ||
    poseId === 'wink' ||
    poseId === 'wand' ||
    poseId === 'happy' ||
    poseId === 'waking'
  );
}
