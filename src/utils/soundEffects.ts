// Celestial UI sound synthesizer using Web Audio API (zero external audio files needed)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function isUiSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem('ctrl_sound_enabled') !== 'false';
}

export function setUiSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('ctrl_sound_enabled', enabled ? 'true' : 'false');
}

export type UiSoundType =
  | 'tap'
  | 'nav'
  | 'success'
  | 'chime'
  | 'pop'
  | 'wand'
  | 'gem'
  | 'quiz-next'
  | 'quiz-complete'
  | 'send'
  | 'receive'
  | 'wake'
  | 'theme-light'
  | 'theme-dark';

function playToneSequence(
  ctx: AudioContext,
  notes: Array<{
    freq: number;
    endFreq?: number;
    delay: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
  }>,
): void {
  const now = ctx.currentTime;
  for (const n of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + n.delay;
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, start);
    if (n.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(n.endFreq, start + n.duration);
    }

    gain.gain.setValueAtTime(0.0008, start);
    gain.gain.linearRampToValueAtTime(n.gain, start + Math.min(0.015, n.duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0008, start + n.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + n.duration + 0.015);
  }
}

export function playUiSound(type: UiSoundType = 'tap', enabled = true): void {
  if (!enabled || !isUiSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (type) {
    case 'tap':
      playToneSequence(ctx, [
        { freq: 680, endFreq: 340, delay: 0, duration: 0.045, gain: 0.055, type: 'sine' },
      ]);
      return;

    case 'nav':
      playToneSequence(ctx, [
        { freq: 523.25, delay: 0, duration: 0.085, gain: 0.05, type: 'triangle' },
        { freq: 659.25, delay: 0.04, duration: 0.095, gain: 0.05, type: 'triangle' },
      ]);
      return;

    case 'pop':
      playToneSequence(ctx, [
        { freq: 380, endFreq: 760, delay: 0, duration: 0.065, gain: 0.06, type: 'sine' },
      ]);
      return;

    case 'send':
      // Crisp upward bubble whoosh when sending a chat message
      playToneSequence(ctx, [
        { freq: 440, endFreq: 880, delay: 0, duration: 0.075, gain: 0.055, type: 'sine' },
        { freq: 1046.5, delay: 0.045, duration: 0.08, gain: 0.035, type: 'triangle' },
      ]);
      return;

    case 'receive':
      // Gentle two-note celestial bell when Luni replies
      playToneSequence(ctx, [
        { freq: 783.99, delay: 0, duration: 0.12, gain: 0.05, type: 'sine' },
        { freq: 1046.5, delay: 0.06, duration: 0.16, gain: 0.055, type: 'sine' },
      ]);
      return;

    case 'wake':
      // Cute rising chirp when Luni wakes up from sleeping
      playToneSequence(ctx, [
        { freq: 587.33, endFreq: 783.99, delay: 0, duration: 0.09, gain: 0.055, type: 'triangle' },
        { freq: 987.77, delay: 0.075, duration: 0.14, gain: 0.055, type: 'sine' },
      ]);
      return;

    case 'wand':
      // Shimmering spell arpeggio when Luni casts wand pose
      playToneSequence(ctx, [
        { freq: 783.99, endFreq: 807, delay: 0, duration: 0.25, gain: 0.05, type: 'sine' },
        { freq: 987.77, endFreq: 1017, delay: 0.04, duration: 0.25, gain: 0.045, type: 'triangle' },
        { freq: 1174.66, endFreq: 1210, delay: 0.08, duration: 0.26, gain: 0.05, type: 'sine' },
        { freq: 1567.98, endFreq: 1615, delay: 0.12, duration: 0.28, gain: 0.045, type: 'triangle' },
        { freq: 2093.0, endFreq: 2155, delay: 0.16, duration: 0.3, gain: 0.04, type: 'sine' },
      ]);
      return;

    case 'gem':
      // High crystal sparkle fanfare for Gemstone Vault unlocks
      playToneSequence(ctx, [
        { freq: 1046.5, delay: 0, duration: 0.16, gain: 0.055, type: 'sine' },
        { freq: 1318.51, delay: 0.05, duration: 0.18, gain: 0.055, type: 'triangle' },
        { freq: 1567.98, delay: 0.1, duration: 0.22, gain: 0.06, type: 'sine' },
        { freq: 2093.0, delay: 0.15, duration: 0.32, gain: 0.055, type: 'sine' },
      ]);
      return;

    case 'quiz-next':
      // Energetic step-up confirmation between CTRL Quiz levels
      playToneSequence(ctx, [
        { freq: 587.33, delay: 0, duration: 0.08, gain: 0.055, type: 'triangle' },
        { freq: 880, delay: 0.045, duration: 0.11, gain: 0.055, type: 'sine' },
      ]);
      return;

    case 'quiz-complete':
    case 'success':
      // Triumphant major chord celebration for finishing CTRL Quiz / Smart Results
      playToneSequence(ctx, [
        { freq: 523.25, delay: 0, duration: 0.18, gain: 0.055, type: 'triangle' },
        { freq: 659.25, delay: 0.06, duration: 0.18, gain: 0.055, type: 'sine' },
        { freq: 783.99, delay: 0.12, duration: 0.2, gain: 0.055, type: 'triangle' },
        { freq: 1046.5, delay: 0.18, duration: 0.34, gain: 0.065, type: 'sine' },
      ]);
      return;

    case 'theme-light':
      // Bright sun-rise ascending chime
      playToneSequence(ctx, [
        { freq: 523.25, delay: 0, duration: 0.1, gain: 0.05, type: 'sine' },
        { freq: 783.99, delay: 0.05, duration: 0.14, gain: 0.05, type: 'sine' },
      ]);
      return;

    case 'theme-dark':
      // Calm moon-set descending chime
      playToneSequence(ctx, [
        { freq: 783.99, delay: 0, duration: 0.1, gain: 0.05, type: 'sine' },
        { freq: 523.25, delay: 0.05, duration: 0.15, gain: 0.05, type: 'sine' },
      ]);
      return;

    case 'chime':
    default:
      playToneSequence(ctx, [
        { freq: 659.25, delay: 0, duration: 0.15, gain: 0.055, type: 'sine' },
        { freq: 880, delay: 0.055, duration: 0.16, gain: 0.055, type: 'sine' },
        { freq: 1174.66, delay: 0.11, duration: 0.2, gain: 0.055, type: 'sine' },
      ]);
      return;
  }
}