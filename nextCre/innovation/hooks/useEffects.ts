'use client';

/* ============================================================
   CONFETTI EFFECT — createConfetti()
   ============================================================ */

const COLORS = ['#ffd04a', '#e63946', '#2196f3', '#4caf50', '#ff8c00', '#fff', '#c471ed'];

export function createConfetti() {
  for (let i = 0; i < 55; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.cssText = `left:${Math.random() * 100}vw;top:0;background:${COLORS[Math.floor(Math.random() * COLORS.length)]};width:${Math.random() * 8 + 5}px;height:${Math.random() * 10 + 7}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:confettiFall ${Math.random() * 2 + 2.4}s ease-in forwards;animation-delay:${Math.random() * 0.5}s;`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }, i * 25);
  }
}

/* ============================================================
   CURSOR SPARKLE
   ============================================================ */
const CURSOR_ICONS = ['✨', '⭐', '💫', '✈️', '🚆', '💨'];
let lastSparkle = 0;

export function setupCursorSparkle() {
  const handler = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastSparkle < 120 || Math.random() > 0.4) return;
    lastSparkle = now;
    const s = document.createElement('div');
    s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;font-size:16px;z-index:1000;animation:confettiFall 0.9s ease-out forwards;`;
    s.textContent = CURSOR_ICONS[Math.floor(Math.random() * CURSOR_ICONS.length)];
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  };
  document.addEventListener('mousemove', handler);
  return () => document.removeEventListener('mousemove', handler);
}
