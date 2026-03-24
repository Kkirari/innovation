/* =====================================================
   CHAPTER ENGINE — assets/js/chapter.js
   Shared engine for ALL chapter lesson pages.
   Requires: CHAPTER_DATA global (from data/chN.js)
   ===================================================== */

/* ------- STATE ------- */
let currentSpeed = 1;
let learnedCount = 0;
const learnedSet = new Set();
let quizScore = 0;
let activeSession = null;
let countdownTimer = null;

const vocab = CHAPTER_DATA.vocab;
const TOTAL = vocab.length;
const grammarCount = CHAPTER_DATA.grammar ? CHAPTER_DATA.grammar.length : 0;
const hasGrammar = grammarCount > 0;
const QUIZ_START_INDEX = TOTAL + 1 + (hasGrammar ? 1 + grammarCount + 1 : 0); 
// TOTAL + Intro(1) = start of next block. Actually slider index is 0-based.
// 0: Intro
// 1 to TOTAL: Vocab
// if hasGrammar: Total+1: GrammarDivider, Total+2 to Total+1+grammarCount: Grammar, Total+2+grammarCount: Roleplay
// Next is QuizDivider -> then Quiz slides

const ACHIEVEMENTS = [
  'สุดยอด! 🎯', 'เก่งมาก! 🌟', 'ว้าว! ✈️', 'เยี่ยมเลย! 🚆',
  'ทำได้ดี! 💫', 'แจ่มมาก! 🏆', 'เจ๋งสุดๆ! ⭐', 'ยอดเยี่ยม! 🎉', 'สุดยอดไปเลย! 🔥'
];

/* ------- QUIZ SETUP: shuffle options per question ------- */
const quizQuestions = vocab.map((_, correctIndex) => {
  const opts = new Set([correctIndex]);
  while (opts.size < 4) opts.add(Math.floor(Math.random() * TOTAL));
  const arr = [...opts];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { correctIndex, options: arr };
});
const quizAnsweredSet = new Set();

/* ------- AUDIO HELPERS ------- */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playBeep(freq = 660, duration = 0.12) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
  } catch (_) { }
}
function speakChinese(text, rate, onEnd) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = rate; u.onend = onEnd; u.onerror = onEnd;
  speechSynthesis.speak(u);
}
function speakThai(text, rate) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'th-TH'; u.rate = rate;
  speechSynthesis.speak(u);
}

/* ------- STOP ALL ------- */
function stopAll() {
  activeSession = null;
  speechSynthesis.cancel();
  if (countdownTimer !== null) { clearInterval(countdownTimer); countdownTimer = null; }
  document.querySelectorAll('.countdown-overlay.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.play-icon').forEach(el => el.style.opacity = '1');
  document.querySelectorAll('.stop-btn.visible').forEach(el => el.classList.remove('visible'));
  document.querySelectorAll('.speaking-indicator.active').forEach(el => el.classList.remove('active'));
}

function setSpeakingUI(index, active) {
  document.getElementById(`stop-btn-${index}`)?.classList.toggle('visible', active);
  document.getElementById(`speak-indicator-${index}`)?.classList.toggle('active', active);
}

/* ------- PLAY + COUNTDOWN + REVEAL ------- */
function playAndShow(index) {
  stopAll();
  const token = Symbol();
  activeSession = { index, token };
  setSpeakingUI(index, true);
  const isActive = () => activeSession && activeSession.token === token;
  const rate = currentSpeed;
  speakChinese(vocab[index].zh, rate, () => {
    if (!isActive()) return;
    setTimeout(() => {
      if (!isActive()) return;
      speakChinese(vocab[index].zh, rate, () => {
        if (!isActive()) return;
        setTimeout(() => { if (!isActive()) return; startCountdown(index, token, rate); }, 400);
      });
    }, 350);
  });
}
function startCountdown(index, token, rate) {
  const isActive = () => activeSession && activeSession.token === token;
  const co = document.getElementById(`countdown-${index}`);
  const cn = document.getElementById(`countdown-num-${index}`);
  const pi = document.querySelector(`#play-btn-${index} .play-icon`);
  co?.classList.add('active');
  if (pi) pi.style.opacity = '0';
  let t = 3;
  if (cn) cn.textContent = t;
  playBeep(880, 0.1);
  countdownTimer = setInterval(() => {
    if (!isActive()) { clearInterval(countdownTimer); countdownTimer = null; return; }
    t--;
    if (cn) cn.textContent = Math.max(t, 1);
    if (t > 0) playBeep(660, 0.08);
    if (t <= 0) {
      clearInterval(countdownTimer); countdownTimer = null;
      if (!isActive()) return;
      co?.classList.remove('active');
      if (pi) pi.style.opacity = '1';
      setSpeakingUI(index, false);
      activeSession = null;
      toggleTranslation(index, true);
      markLearned(index);
      setTimeout(() => speakThai(vocab[index].th, currentSpeed), 120);
    }
  }, 1000);
}
function handleStop(index) {
  stopAll();
  document.getElementById(`countdown-${index}`)?.classList.remove('active');
  const pi = document.querySelector(`#play-btn-${index} .play-icon`);
  if (pi) pi.style.opacity = '1';
  setSpeakingUI(index, false);
}

/* ------- GRAMMAR ACTIONS ------- */
function playGrammar(index) {
  stopAll();
  const text = CHAPTER_DATA.grammar[index].zh;
  const icon = document.getElementById(`g-play-icon-${index}`);
  if (icon) icon.style.opacity = '0.5';
  speakChinese(text, currentSpeed, () => {
    if (icon) icon.style.opacity = '1';
  });
}
function randomizeRoleplay() {
  const gList = CHAPTER_DATA.grammar;
  if (!gList || gList.length === 0) return;
  const randIndex = Math.floor(Math.random() * gList.length);
  const data = gList[randIndex];
  
  document.getElementById('roleplay-sentence-zh').textContent = data.zh;
  document.getElementById('roleplay-sentence-th').textContent = data.th;
  document.getElementById('role-a-text').textContent = data.roles ? data.roles[0] : 'A';
  document.getElementById('role-b-text').textContent = data.roles ? data.roles[1] : 'B';
  createConfetti();
}

/* ------- TRANSLATION TOGGLE ------- */
function toggleTranslation(index, forceOpen = false) {
  const c = document.getElementById(`container-${index}`);
  if (!c) return;
  if (forceOpen || !c.classList.contains('show-translation')) c.classList.add('show-translation');
  else c.classList.remove('show-translation');
}
function closeTranslation(index) {
  document.getElementById(`container-${index}`)?.classList.remove('show-translation');
}

/* ------- MARK LEARNED ------- */
function markLearned(index) {
  if (learnedSet.has(index)) return;
  learnedSet.add(index); learnedCount++;
  const ach = document.getElementById('achievement');
  document.getElementById('achievementText').textContent =
    ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)];
  ach.classList.add('show');
  createConfetti();
  setTimeout(() => ach.classList.remove('show'), 2200);
  document.getElementById('counter').textContent = `${learnedCount}/${TOTAL}`;
  document.getElementById('progressFill').style.width = `${(learnedCount / TOTAL) * 100}%`;
}

/* ------- CONFETTI ------- */
function createConfetti() {
  const colors = ['#ffd04a', '#e63946', '#2196f3', '#4caf50', '#ff8c00', '#fff', '#c471ed'];
  for (let i = 0; i < 55; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.cssText = `left:${Math.random() * 100}vw;top:0;background:${colors[Math.floor(Math.random() * colors.length)]};width:${Math.random() * 8 + 5}px;height:${Math.random() * 10 + 7}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:confettiFall ${Math.random() * 2 + 2.4}s ease-in forwards;animation-delay:${Math.random() * 0.5}s;`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }, i * 25);
  }
}

/* ------- QUIZ ------- */
function checkAnswer(qi, chosenIndex) {
  if (quizAnsweredSet.has(qi)) return;
  quizAnsweredSet.add(qi);
  const { correctIndex, options } = quizQuestions[qi];
  const fb = document.getElementById(`quiz-feedback-${qi}`);
  options.forEach(oi => document.getElementById(`qopt-${qi}-${oi}`)?.classList.add('disabled'));
  document.getElementById(`qopt-${qi}-${correctIndex}`)?.classList.add('correct');
  if (chosenIndex === correctIndex) {
    quizScore++;
    fb.textContent = '✅ ถูกต้อง! เก่งมาก!';
    createConfetti();
  } else {
    document.getElementById(`qopt-${qi}-${chosenIndex}`)?.classList.add('wrong');
    fb.textContent = `❌ คำตอบที่ถูกคือ "${vocab[correctIndex].zh}" = ${vocab[correctIndex].th}`;
  }
  updateQuizScore();
  speechSynthesis.cancel();
  speakChinese(vocab[correctIndex].zh, currentSpeed, () => { });
}
function updateQuizScore() {
  document.getElementById('quizScoreText').textContent = `${quizScore}/${TOTAL}`;
}

/* ------- SECTION UI ------- */
function updateSectionUI(slideIndex) {
  const isIntro = slideIndex === 0;
  const isQuiz = slideIndex >= QUIZ_START_INDEX;
  const isGrammar = hasGrammar && slideIndex > TOTAL && slideIndex < QUIZ_START_INDEX;

  const lbl = document.getElementById('sectionLabel');
  lbl.style.display = isIntro ? 'none' : '';
  document.getElementById('vocabCounter').style.display = (isQuiz || isIntro || isGrammar) ? 'none' : 'flex';
  document.getElementById('quizScoreDisplay').style.display = isQuiz ? 'flex' : 'none';
  document.getElementById('speedControl').style.display = 'none';
  
  if (isQuiz) {
    lbl.textContent = '🏆 แบบฝึกหัด';
    lbl.className = 'section-label quiz';
    lbl.style.background = ''; // reset inline
  } else if (isGrammar) {
    lbl.textContent = '📘 ไวยากรณ์';
    lbl.className = 'section-label';
    lbl.style.background = '#4caf50'; // grammar green
  } else {
    lbl.textContent = CHAPTER_DATA.chapterLabel || '📖 บทเรียน';
    lbl.className = 'section-label vocab';
    lbl.style.background = ''; // reset inline
  }
}

/* ------- BUILD SLIDES ------- */
(function buildSlides() {
  const wrapper = document.getElementById('slides');
  const d = CHAPTER_DATA;

  // Intro slide
  const introSlide = document.createElement('div');
  introSlide.className = 'swiper-slide';
  introSlide.innerHTML = `
    <div class="intro-slide-box">
      <div class="chapter-badge">📖 บทที่ ${d.chapterNum}</div>
      <div class="intro-main-card">
        <span class="intro-zh">${d.titleZh}</span>
        <span class="intro-th">${d.titleTh}</span>
      </div>
      <div class="intro-emoji-banner">
        ${(d.introBanner || []).map(e => `<span>${e}</span>`).join('')}
      </div>
      <button class="start-btn" onclick="swiper.slideNext()">🚀 เริ่มเรียน!</button>
    </div>`;
  wrapper.appendChild(introSlide);

  // Vocab slides
  vocab.forEach((v, i) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.innerHTML = `
      <div class="slide-box">
        <div class="cards-container" id="container-${i}">
          <div class="vocab-card-wrap">
            <div class="card">
              <div class="card-stripe"></div>
              <div class="card-num">#${String(i + 1).padStart(2, '0')}</div>
              <div class="word-section">
                <div class="word">${v.zh}</div>
                <div class="pinyin">${v.py}</div>
                <div class="speaking-indicator" id="speak-indicator-${i}">
                  <div class="speaking-bar"></div><div class="speaking-bar"></div>
                  <div class="speaking-bar"></div><div class="speaking-bar"></div>
                </div>
                <div class="btn-row">
                  <button class="translate-btn" onclick="playAndShow(${i})" id="play-btn-${i}">
                    <span class="play-icon">▶</span>
                    <div class="countdown-overlay" id="countdown-${i}">
                      <div class="countdown-number" id="countdown-num-${i}">3</div>
                    </div>
                  </button>
                  <button class="stop-btn" onclick="handleStop(${i})" id="stop-btn-${i}">⏹</button>
                </div>
              </div>
            </div>
          </div>
          <div class="translation-card-wrap" id="trans-wrap-${i}">
            <div class="translation-card">
              <button class="close-btn" onclick="closeTranslation(${i})">×</button>
              <img src="assets/img/${v.img}" class="translation-emoji" alt="${v.th}" style="height:100px;width:auto;object-fit:contain;">
              <div class="translation-text">${v.th}</div>
              <div class="pinyin" style="font-size:22px;margin-top:-10px;">${v.py}</div>
            </div>
          </div>
        </div>
      </div>`;
    wrapper.appendChild(slide);
  });

  // Grammar slides
  if (hasGrammar) {
    // Grammar divider
    const grammarDivider = document.createElement('div');
    grammarDivider.className = 'swiper-slide';
    grammarDivider.innerHTML = `
      <div class="quiz-divider-box" style="background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);">
        <div class="quiz-badge" style="color: #56ab2f;">📘 ไวยากรณ์</div>
        <div class="quiz-title">เรียนรู้ประโยค</div>
        <div class="quiz-subtitle" style="margin-bottom: 20px;">มาดูวิธีใช้คำว่า "比" (กว่า) กันเถอะ!<br>เปรียบเทียบสิ่งต่างๆ 📏</div>
        <div class="intro-emoji-banner" style="margin-bottom: 30px;"><span>🗣️</span><span>⚖️</span><span>🍎</span></div>
        <button class="quiz-start-btn" style="color: #56ab2f;" onclick="swiper.slideNext()">👉 ดูประโยค</button>
      </div>`;
    wrapper.appendChild(grammarDivider);

    // Grammar sentences
    d.grammar.forEach((g, i) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="slide-box">
          <div class="cards-container">
            <div class="vocab-card-wrap">
              <div class="card" style="padding: 40px 20px;">
                <div class="card-stripe" style="background:#56ab2f;"></div>
                <div class="word-section">
                  <div class="word" style="font-size: min(48px, 10vw); line-height: 1.4; white-space: normal;">${g.zh}</div>
                  <div class="pinyin" style="font-size: 24px; color: #666; margin-top: 15px;">${g.py}</div>
                  <div class="th-translate" style="font-size: 26px; color: #ff5722; font-weight: 700; margin-top: 20px;">${g.th}</div>
                  <div class="btn-row" style="margin-top: 30px; display:flex; justify-content:center;">
                    <button class="translate-btn" style="background:#56ab2f; box-shadow: 0 6px 0 #388e3c; width:auto; padding:0 30px;" onclick="playGrammar(${i})">
                      <span class="play-icon" id="g-play-icon-${i}">▶ ฟังเสียง</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      wrapper.appendChild(slide);
    });

    // Roleplay Activity
    const roleplaySlide = document.createElement('div');
    roleplaySlide.className = 'swiper-slide';
    roleplaySlide.innerHTML = `
      <div class="quiz-divider-box" style="background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); padding: 30px 20px;">
        <div class="quiz-badge" style="color: #FF5E62;">🎭 กิจกรรมสวมบทบาท</div>
        <div class="quiz-title" style="font-size:36px; margin-bottom: 10px;">จับคู่ Roleplay!</div>
        <div class="quiz-subtitle" style="margin-bottom: 20px;">จับคู่กับเพื่อน แล้วแสดงท่าทางตามประโยค! 🙌</div>
        
        <div style="background: rgba(255,255,255,0.9); border-radius: 20px; padding: 25px 15px; width: 100%; max-width: 400px; margin: 0 auto 25px auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:24px; font-weight:bold;">
            <div style="color:#2196f3;">A: <span id="role-a-text">???</span></div>
            <div style="color:#e91e63;">B: <span id="role-b-text">???</span></div>
          </div>
          <div id="roleplay-sentence-zh" style="font-size:32px; font-weight:bold; color:#333; margin-bottom:10px;">กดปุ่มสุ่มเลย!</div>
          <div id="roleplay-sentence-th" style="font-size:20px; color:#ff5722; font-weight:bold;"></div>
        </div>

        <button class="quiz-start-btn" style="color: #FF5E62; margin-bottom:15px;" onclick="randomizeRoleplay()">🎲 สุ่มประโยคสำหรับฝึกคู่</button>
        <button class="quiz-start-btn" style="background: transparent; color: #fff; border: 2px solid #fff; box-shadow: none;" onclick="swiper.slideNext()">ไปทำแบบฝึกหัด 👉</button>
      </div>`;
    wrapper.appendChild(roleplaySlide);
  }

  // Quiz divider
  const quizDivider = document.createElement('div');
  quizDivider.className = 'swiper-slide';
  quizDivider.innerHTML = `
    <div class="quiz-divider-box">
      <div class="quiz-badge">🏆 แบบฝึกหัด</div>
      <div class="quiz-title">ทายคำศัพท์!</div>
      <div class="quiz-subtitle">เห็นรูปภาพแล้วเลือกตัวอักษรจีนให้ถูก<br>มาทดสอบความจำกัน! 🎯</div>
      <div class="intro-emoji-banner"><span>🤔</span><span>✈️</span><span>🚆</span><span>📏</span><span>🎯</span></div>
      <button class="quiz-start-btn" onclick="swiper.slideNext()">🎮 เริ่มทำแบบฝึกหัด!</button>
    </div>`;
  wrapper.appendChild(quizDivider);

  // Quiz slides
  vocab.forEach((v, i) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    const { options } = quizQuestions[i];
    const optBtns = options.map(oi =>
      `<button class="quiz-option-btn" id="qopt-${i}-${oi}" onclick="checkAnswer(${i},${oi})">${vocab[oi].zh}</button>`
    ).join('');
    slide.innerHTML = `
      <div class="slide-box">
        <div class="quiz-card-wrapper">
          <div class="quiz-question-card">
            <img src="assets/img/${v.img}" class="quiz-question-emoji" alt="question">
            <div class="quiz-question-label">คำนี้ภาษาจีนคืออะไร? (${v.th})</div>
          </div>
          <div class="quiz-options-grid">${optBtns}</div>
          <div class="quiz-feedback" id="quiz-feedback-${i}"></div>
        </div>
      </div>`;
    wrapper.appendChild(slide);
  });
})();

/* ------- CURSOR SPARKLE ------- */
const CURSOR_ICONS = ['✨', '⭐', '💫', '✈️', '🚆', '💨'];
let lastSparkle = 0;
document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastSparkle < 120 || Math.random() > 0.4) return;
  lastSparkle = now;
  const s = document.createElement('div');
  s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;font-size:16px;z-index:1000;animation:confettiFall 0.9s ease-out forwards;`;
  s.textContent = CURSOR_ICONS[Math.floor(Math.random() * CURSOR_ICONS.length)];
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 950);
});

/* ------- SWIPER INIT ------- */
const swiper = new Swiper('.swiper', {
  effect: 'creative',
  creativeEffect: {
    prev: { translate: ['-110%', 0, -400], rotate: [0, 0, -12] },
    next: { translate: ['110%', 0, -400], rotate: [0, 0, 12] },
  },
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.nav-next', prevEl: '.nav-prev' },
  on: {
    slideChange() {
      stopAll();
      document.querySelectorAll('.cards-container').forEach(c => c.classList.remove('show-translation'));
      updateSectionUI(this.activeIndex);
    }
  }
});

/* ------- INIT ------- */
updateQuizScore();
updateSectionUI(0);
