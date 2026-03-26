'use client';

/* ============================================================
   AUDIO HELPERS — useAudio hook
   Provides speech synthesis and beep functions
   ============================================================ */

let audioCtx: AudioContext | null = null;

function getAudioCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return audioCtx;
}

export function playBeep(freq = 660, duration = 0.12) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* silent */
  }
}

export function speakChinese(text: string, rate: number, onEnd?: () => void) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  speechSynthesis.speak(u);
}

export function speakThai(text: string, rate: number) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH';
  u.rate = rate;
  speechSynthesis.speak(u);
}

export function stopSpeech() {
  speechSynthesis.cancel();
}
