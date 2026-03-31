'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import '@/styles/chapter.css';

import { ChapterData } from '@/data/types';
import Background from './Background';
import { playBeep, speakChinese, speakThai, stopSpeech } from '@/hooks/useAudio';
import { createConfetti, setupCursorSparkle } from '@/hooks/useEffects';
import { useChapterProgress } from '@/hooks/useProgress';

/* ============================================================
   QUIZ SETUP
   ============================================================ */
interface QuizQuestion {
  correctIndex: number;
  options: number[];
}
function buildQuizQuestions(total: number): QuizQuestion[] {
  if (total === 0) return [];
  const maxOpts = Math.min(4, total);
  return Array.from({ length: total }, (_, correctIndex) => {
    const opts = new Set([correctIndex]);
    while (opts.size < maxOpts) {
      opts.add(Math.floor(Math.random() * total));
    }
    const arr = [...opts];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return { correctIndex, options: arr };
  });
}

const ACHIEVEMENTS = [
  'สุดยอด! 🎯', 'เก่งมาก! 🌟', 'ว้าว! ✈️', 'เยี่ยมเลย! 🚆',
  'ทำได้ดี! 💫', 'แจ่มมาก! 🏆', 'เจ๋งสุดๆ! ⭐', 'ยอดเยี่ยม! 🎉', 'สุดยอดไปเลย! 🔥',
];

import { useAdminData } from '@/hooks/useAdminData';

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
import { useRouter } from 'next/navigation';

interface ChapterEngineProps {
  data: ChapterData;
  mode?: 'vocab' | 'grammar' | 'quiz' | 'all';
}

function ChapterEngineContent({ data, mode = 'all' }: ChapterEngineProps) {
  const router = useRouter();
  const vocab = data.vocab;
  const TOTAL = vocab.length;
  const grammarCount = data.grammar ? data.grammar.length : 0;
  const hasGrammar = grammarCount > 0;

  // Progress hook
  const { markVocabLearned, markAllVocabLearned, updateQuizScore, markCompleted, markGrammarCompleted, learnedCount } = useChapterProgress(data.chapterNum, TOTAL);

  // State
  const [quizScore, setQuizScore] = useState(0);
  const [achievementText, setAchievementText] = useState('');
  const [achievementShow, setAchievementShow] = useState(false);
  const [sectionMode, setSectionMode] = useState<'intro' | 'vocab' | 'grammar' | 'quiz'>('intro');
  const [sectionLabelText, setSectionLabelText] = useState(data.chapterLabel || '📖 บทเรียน');
  const [showTranslation, setShowTranslation] = useState<Record<number, boolean>>({});
  const [quizAnswered, setQuizAnswered] = useState<Record<number, boolean>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, string>>({});
  const [quizOptionStates, setQuizOptionStates] = useState<Record<string, string>>({});
  const [countdownIndex, setCountdownIndex] = useState<number | null>(null);
  const [countdownNum, setCountdownNum] = useState(3);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [roleplayData, setRoleplayData] = useState({ zh: 'กดปุ่มสุ่มเลย!', th: '', roleA: '???', roleB: '???' });
  const [randomImageSrc, setRandomImageSrc] = useState<string | null>(null);

  const learnedSetRef = useRef(new Set<number>());
  const quizQuestionsRef = useRef<QuizQuestion[]>(buildQuizQuestions(TOTAL));
  const quizScoreRef = useRef(0);
  const activeSessionRef = useRef<symbol | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const hasGrammarImages = data.grammarImages && data.grammarImages.length > 0;
  const showRoleplay = data.showRoleplay !== false; // default true
  const QUIZ_START_INDEX = TOTAL + 1 + (hasGrammar ? 1 + grammarCount + (hasGrammarImages ? 1 : 0) + (showRoleplay ? 1 : 0) : 0);

  // Cursor sparkle setup
  useEffect(() => setupCursorSparkle(), []);

  // StopAll
  const stopAll = useCallback(() => {
    activeSessionRef.current = null;
    stopSpeech();
    if (countdownTimerRef.current !== null) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownIndex(null);
    setSpeakingIndex(null);
  }, []);

  // Mark learned — now saves to localStorage via progress hook
  const markLearned = useCallback((index: number) => {
    if (learnedSetRef.current.has(index)) return;
    learnedSetRef.current.add(index);
    markVocabLearned(index);
    setAchievementText(ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]);
    setAchievementShow(true);
    createConfetti();
    setTimeout(() => setAchievementShow(false), 2200);
  }, [markVocabLearned]);

  // Translation controls
  const openTranslation = useCallback((index: number) => {
    setShowTranslation(prev => ({ ...prev, [index]: true }));
  }, []);
  const closeTranslation = useCallback((index: number) => {
    setShowTranslation(prev => ({ ...prev, [index]: false }));
  }, []);

  // Play and show vocab
  const playAndShow = useCallback((index: number) => {
    stopAll();
    const token = Symbol();
    activeSessionRef.current = token;
    setSpeakingIndex(index);
    const rate = 1;
    const isActive = () => activeSessionRef.current === token;

    speakChinese(vocab[index].zh, rate, () => {
      if (!isActive()) return;
      setTimeout(() => {
        if (!isActive()) return;
        speakChinese(vocab[index].zh, rate, () => {
          if (!isActive()) return;
          setTimeout(() => {
            if (!isActive()) return;
            setCountdownIndex(index);
            let t = 3;
            setCountdownNum(t);
            playBeep(880, 0.1);
            countdownTimerRef.current = setInterval(() => {
              if (!isActive()) {
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
                return;
              }
              t--;
              setCountdownNum(Math.max(t, 1));
              if (t > 0) playBeep(660, 0.08);
              if (t <= 0) {
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                countdownTimerRef.current = null;
                if (!isActive()) return;
                setCountdownIndex(null);
                setSpeakingIndex(null);
                activeSessionRef.current = null;
                openTranslation(index);
                markLearned(index);
                setTimeout(() => speakThai(vocab[index].th, 1), 120);
              }
            }, 1000);
          }, 400);
        });
      }, 350);
    });
  }, [stopAll, vocab, openTranslation, markLearned]);

  const handleStop = useCallback(() => {
    stopAll();
    setCountdownIndex(null);
    setSpeakingIndex(null);
  }, [stopAll]);

  // Grammar play
  const playGrammar = useCallback((index: number) => {
    stopAll();
    if (data.grammar?.[index]) {
      speakChinese(data.grammar[index].zh, 1);
    }
  }, [stopAll, data.grammar]);

  // Roleplay randomize
  const randomizeRoleplay = useCallback(() => {
    if (!data.grammar || data.grammar.length === 0) return;
    const randIndex = Math.floor(Math.random() * data.grammar.length);
    const g = data.grammar[randIndex];
    setRoleplayData({
      zh: g.zh, th: g.th,
      roleA: g.roles?.[0] || 'A', roleB: g.roles?.[1] || 'B',
    });
    createConfetti();
  }, [data.grammar]);

  // Random image
  const randomizeImage = useCallback(() => {
    if (!data.grammarImages || data.grammarImages.length === 0) return;
    const randIndex = Math.floor(Math.random() * data.grammarImages.length);
    setRandomImageSrc(data.grammarImages[randIndex]);
    createConfetti();
  }, [data.grammarImages]);

  // Quiz check answer — now saves best score to localStorage
  const checkAnswer = useCallback((qi: number, chosenIndex: number) => {
    if (quizAnswered[qi]) return;
    setQuizAnswered(prev => ({ ...prev, [qi]: true }));
    const { correctIndex, options } = quizQuestionsRef.current[qi];

    const newStates: Record<string, string> = {};
    options.forEach(oi => { newStates[`${qi}-${oi}`] = 'disabled'; });
    newStates[`${qi}-${correctIndex}`] = 'correct';
    if (chosenIndex !== correctIndex) {
      newStates[`${qi}-${chosenIndex}`] = 'wrong';
    }
    setQuizOptionStates(prev => ({ ...prev, ...newStates }));

    if (chosenIndex === correctIndex) {
      quizScoreRef.current++;
      setQuizScore(quizScoreRef.current);
      setQuizFeedback(prev => ({ ...prev, [qi]: '✅ ถูกต้อง! เก่งมาก!' }));
      createConfetti();
    } else {
      setQuizFeedback(prev => ({
        ...prev,
        [qi]: `❌ คำตอบที่ถูกคือ "${vocab[correctIndex].zh}" = ${vocab[correctIndex].th}`,
      }));
    }
    // Save best quiz score
    updateQuizScore(quizScoreRef.current);
    stopSpeech();
    speakChinese(vocab[correctIndex].zh, 1);
  }, [quizAnswered, vocab, updateQuizScore]);

  // Section UI update
  const updateSectionUI = useCallback((slideIndex: number) => {
    if (slideIndex === 0) {
      setSectionMode('intro');
      return;
    }
    if (mode === 'vocab') { setSectionMode('vocab'); setSectionLabelText(data.chapterLabel || '📖 บทเรียน'); }
    else if (mode === 'grammar') { setSectionMode('grammar'); setSectionLabelText('📘 ไวยากรณ์'); }
    else if (mode === 'quiz') { setSectionMode('quiz'); setSectionLabelText('🏆 แบบฝึกหัด'); }
    else {
      const isQuiz = slideIndex >= QUIZ_START_INDEX;
      const isGrammar = hasGrammar && slideIndex > TOTAL && slideIndex < QUIZ_START_INDEX;
      if (isQuiz) { setSectionMode('quiz'); setSectionLabelText('🏆 แบบฝึกหัด'); }
      else if (isGrammar) { setSectionMode('grammar'); setSectionLabelText('📘 ไวยากรณ์'); }
      else { setSectionMode('vocab'); setSectionLabelText(data.chapterLabel || '📖 บทเรียน'); }
    }
  }, [QUIZ_START_INDEX, hasGrammar, TOTAL, data.chapterLabel, mode]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    stopAll();
    setShowTranslation({});
    updateSectionUI(swiper.activeIndex);
    if (mode === 'grammar' && swiper.isEnd) {
      markGrammarCompleted();
    }
  }, [stopAll, updateSectionUI, mode, markGrammarCompleted]);

  // Progress derived values
  const progressWidth = TOTAL > 0 ? (learnedCount / TOTAL) * 100 : 0;

  /* ============================================================
     RENDER SLIDES
     ============================================================ */
  const slides: React.ReactNode[] = [];

  // === INTRO SLIDE ===
  let introSubText = data.titleTh;
  let introBtnText = '🚀 เริ่มเรียน!';
  if (mode === 'vocab') { introSubText = '📖 เรียนคำศัพท์'; }
  else if (mode === 'grammar') { introSubText = '📘 ไวยากรณ์และประโยค'; }
  else if (mode === 'quiz') { introSubText = '🏆 แบบฝึกหัดท้ายบท'; introBtnText = 'เริ่มทำแบบฝึกหัด!'; }

  slides.push(
    <SwiperSlide key="intro">
      <div className="intro-slide-box">
        <div className="chapter-badge">บทที่ {data.chapterNum}</div>
        <div className="intro-main-card">
          <span className="intro-zh">{data.titleZh}</span>
          <span className="intro-th">{introSubText}</span>
        </div>
        <div className="intro-emoji-banner">
          {(data.introBanner || []).map((e, i) => <span key={i}>{e}</span>)}
        </div>
        <button className="start-btn" onClick={() => swiperRef.current?.slideNext()}>
          {introBtnText}
        </button>
      </div>
    </SwiperSlide>
  );

  // === VOCAB SLIDES ===
  if (mode === 'all' || mode === 'vocab') {
  vocab.forEach((v, i) => {
    const isTranslationOpen = showTranslation[i] || false;
    const isCountdown = countdownIndex === i;
    const isSpeaking = speakingIndex === i;

    slides.push(
      <SwiperSlide key={`vocab-${i}`}>
        <div className="slide-box">
          <div className={`cards-container${isTranslationOpen ? ' show-translation' : ''}`}>
            <div className="vocab-card-wrap">
              <div className="card">
                <div className="card-stripe" />
                <div className="card-num">#{String(i + 1).padStart(2, '0')}</div>
                <div className="word-section">
                  <div className="word">{v.zh}</div>
                  <div className="pinyin">{v.py}</div>
                  <div className={`speaking-indicator${isSpeaking ? ' active' : ''}`}>
                    <div className="speaking-bar" /><div className="speaking-bar" />
                    <div className="speaking-bar" /><div className="speaking-bar" />
                  </div>
                  <div className="btn-row">
                    <button className="translate-btn" onClick={() => playAndShow(i)}>
                      <span className="play-icon" style={{ opacity: isCountdown ? 0 : 1 }}>▶</span>
                      <div className={`countdown-overlay${isCountdown ? ' active' : ''}`}>
                        <div className="countdown-number">{countdownNum}</div>
                      </div>
                    </button>
                    <button className={`stop-btn${isSpeaking ? ' visible' : ''}`} onClick={handleStop}>⏹</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="translation-card-wrap">
              <div className="translation-card">
                <button className="close-btn" onClick={() => closeTranslation(i)}>×</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/${v.img}`} className="translation-emoji" alt={v.th} style={{ height: '100px', width: 'auto', objectFit: 'contain' }} />
                <div className="translation-text">{v.th}</div>
                <div className="pinyin" style={{ fontSize: '22px', marginTop: '-10px' }}>{v.py}</div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>
    );
  });
  }

  // === GRAMMAR SLIDES ===
  if ((mode === 'all' || mode === 'grammar') && hasGrammar && data.grammar) {
    slides.push(
      <SwiperSlide key="grammar-divider">
        <div className="quiz-divider-box" style={{ background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)' }}>
          <div className="quiz-badge" style={{ color: '#56ab2f' }}>📘 ไวยากรณ์</div>
          <div className="quiz-title">เรียนรู้ประโยค</div>
          <div className="quiz-subtitle" style={{ marginBottom: '20px' }}>
            มาดูวิธีใช้คำว่า &quot;比&quot; (กว่า) กันเถอะ!<br/>เปรียบเทียบสิ่งต่างๆ 📏
          </div>
          <div className="intro-emoji-banner" style={{ marginBottom: '30px' }}>
            <span>🗣️</span><span>⚖️</span><span>🍎</span>
          </div>
          <button className="quiz-start-btn" style={{ color: '#56ab2f' }} onClick={() => swiperRef.current?.slideNext()}>
            👉 ดูประโยค
          </button>
        </div>
      </SwiperSlide>
    );

    data.grammar.forEach((g, i) => {
      slides.push(
        <SwiperSlide key={`grammar-${i}`}>
          <div className="slide-box">
            <div className="cards-container">
              <div className="vocab-card-wrap">
                <div className="card" style={{ padding: '40px 20px' }}>
                  <div className="card-stripe" style={{ background: '#56ab2f' }} />
                  <div className="word-section">
                    {g.bZh || (g.dialogues && g.dialogues.length > 0) ? (
                      <div className="dialogue-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', width: '100%', maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px' }}>
                        {/* Person A */}
                        <div style={{ background: '#f0f9ff', padding: '15px 20px', borderRadius: '15px', borderLeft: '4px solid #38bdf8' }}>
                          <div style={{ fontWeight: 'bold', color: '#0284c7', marginBottom: '5px', fontSize: '16px' }}>🗣️ {g.roles?.[0] || 'A'}:</div>
                          <div className="word" style={{ fontSize: 'min(32px, 7vw)', lineHeight: 1.3 }}>{g.zh}</div>
                          <div className="pinyin" style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>{g.py}</div>
                          <div style={{ fontSize: '18px', color: '#ea580c', fontWeight: 600, marginTop: '4px' }}>{g.th}</div>
                        </div>
                        {/* Person B */}
                        {g.bZh && (
                          <div style={{ background: '#fdf2f8', padding: '15px 20px', borderRadius: '15px', borderLeft: '4px solid #f472b6' }}>
                            <div style={{ fontWeight: 'bold', color: '#be185d', marginBottom: '5px', fontSize: '16px' }}>🗣️ {g.roles?.[1] || 'B'}:</div>
                            <div className="word" style={{ fontSize: 'min(32px, 7vw)', lineHeight: 1.3 }}>{g.bZh}</div>
                            <div className="pinyin" style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>{g.bPy}</div>
                            <div style={{ fontSize: '18px', color: '#ea580c', fontWeight: 600, marginTop: '4px' }}>{g.bTh}</div>
                          </div>
                        )}
                        {/* Additional Dialogues */}
                        {(g.dialogues || []).map((dl, dIdx) => {
                          const isA = dIdx % 2 !== (g.bZh ? 0 : 1);
                          return (
                            <div key={dIdx} style={{ background: isA ? '#f0f9ff' : '#fdf2f8', padding: '15px 20px', borderRadius: '15px', borderLeft: `4px solid ${isA ? '#38bdf8' : '#f472b6'}` }}>
                              <div style={{ fontWeight: 'bold', color: isA ? '#0284c7' : '#be185d', marginBottom: '5px', fontSize: '16px' }}>🗣️ {dl.speaker}:</div>
                              <div className="word" style={{ fontSize: 'min(32px, 7vw)', lineHeight: 1.3 }}>{dl.zh}</div>
                              <div className="pinyin" style={{ fontSize: '18px', color: '#666', marginTop: '4px' }}>{dl.py}</div>
                              <div style={{ fontSize: '18px', color: '#ea580c', fontWeight: 600, marginTop: '4px' }}>{dl.th}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        <div className="word" style={{ fontSize: 'min(48px, 10vw)', lineHeight: 1.4, whiteSpace: 'normal' }}>{g.zh}</div>
                        <div className="pinyin" style={{ fontSize: '24px', color: '#666', marginTop: '15px' }}>{g.py}</div>
                        <div style={{ fontSize: '26px', color: '#ff5722', fontWeight: 700, marginTop: '20px' }}>{g.th}</div>
                      </>
                    )}
                    <div className="btn-row" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                      <button className="translate-btn" style={{ background: '#56ab2f', boxShadow: '0 6px 0 #388e3c', width: 'auto', padding: '0 30px' }} onClick={() => playGrammar(i)}>
                        <span className="play-icon">▶ ฟังเสียง</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      );
    });

    // Random Image slide (if grammarImages exist)
    if (hasGrammarImages) {
      slides.push(
        <SwiperSlide key="random-image">
          <div className="quiz-divider-box" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px 20px' }}>
            <div className="quiz-badge" style={{ color: '#764ba2' }}>🖼️ สุ่มรูปภาพ</div>
            <div className="quiz-title" style={{ fontSize: '36px', marginBottom: '10px' }}>ดูรูปแล้วฝึกพูด!</div>
            <div className="quiz-subtitle" style={{ marginBottom: '20px' }}>กดสุ่มรูปภาพ แล้วฝึกพูดประโยคที่เกี่ยวข้อง 🗣️</div>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '400px', margin: '0 auto 25px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {randomImageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/images/${randomImageSrc}`} alt="random" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '12px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', fontSize: '20px' }}>
                  <div style={{ fontSize: '60px', marginBottom: '10px' }}>🖼️</div>
                  กดปุ่มด้านล่างเพื่อสุ่มรูปภาพ
                </div>
              )}
            </div>
            <button className="quiz-start-btn" style={{ color: '#764ba2', marginBottom: '15px' }} onClick={randomizeImage}>
              🎲 สุ่มรูปภาพ
            </button>
            <button className="quiz-start-btn" style={{ background: 'transparent', color: '#fff', border: '2px solid #fff', boxShadow: 'none' }} onClick={() => swiperRef.current?.slideNext()}>
              ไปต่อ 👉
            </button>
          </div>
        </SwiperSlide>
      );
    }

    if (showRoleplay) {
      slides.push(
        <SwiperSlide key="roleplay">
          <div className="quiz-divider-box" style={{ background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', padding: '30px 20px' }}>
            <div className="quiz-badge" style={{ color: '#FF5E62' }}>🎭 กิจกรรมสวมบทบาท</div>
            <div className="quiz-title" style={{ fontSize: '36px', marginBottom: '10px' }}>จับคู่ Roleplay!</div>
            <div className="quiz-subtitle" style={{ marginBottom: '20px' }}>จับคู่กับเพื่อน แล้วแสดงท่าทางตามประโยค! 🙌</div>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '25px 15px', width: '100%', maxWidth: '400px', margin: '0 auto 25px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '24px', fontWeight: 'bold' }}>
                <div style={{ color: '#2196f3' }}>A: <span>{roleplayData.roleA}</span></div>
                <div style={{ color: '#e91e63' }}>B: <span>{roleplayData.roleB}</span></div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>{roleplayData.zh}</div>
            </div>
            <button className="quiz-start-btn" style={{ color: '#FF5E62', marginBottom: '15px' }} onClick={randomizeRoleplay}>
              🎲 สุ่มประโยคสำหรับฝึกคู่
            </button>
            <button className="quiz-start-btn" style={{ background: 'transparent', color: '#fff', border: '2px solid #fff', boxShadow: 'none' }} onClick={() => swiperRef.current?.slideNext()}>
              ไปทำแบบฝึกหัด 👉
            </button>
          </div>
        </SwiperSlide>
      );
    }
  }

  // === QUIZ DIVIDER ===
  if (mode === 'all' || mode === 'quiz') {
  if (mode === 'all') {
    slides.push(
      <SwiperSlide key="quiz-divider">
        <div className="quiz-divider-box">
          <div className="quiz-badge">🏆 แบบฝึกหัด</div>
          <div className="quiz-title">ทายคำศัพท์!</div>
          <div className="quiz-subtitle">เห็นรูปภาพแล้วเลือกตัวอักษรจีนให้ถูก<br/>มาทดสอบความจำกัน! 🎯</div>
          <div className="intro-emoji-banner">
            <span>🤔</span><span>✈️</span><span>🚆</span><span>📏</span><span>🎯</span>
          </div>
          <button className="quiz-start-btn" onClick={() => swiperRef.current?.slideNext()}>
            🎮 เริ่มทำแบบฝึกหัด!
          </button>
        </div>
      </SwiperSlide>
    );
  }

  // === QUIZ SLIDES ===
  vocab.forEach((v, i) => {
    const { options } = quizQuestionsRef.current[i];
    slides.push(
      <SwiperSlide key={`quiz-${i}`}>
        <div className="slide-box">
          <div className="quiz-card-wrapper">
            <div className="quiz-question-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/${v.img}`} className="quiz-question-emoji" alt="question" />
              <div className="quiz-question-label">คำนี้ภาษาจีนคืออะไร? ({v.th})</div>
            </div>
            <div className="quiz-options-grid">
              {options.map(oi => (
                <button key={oi} className={`quiz-option-btn ${quizOptionStates[`${i}-${oi}`] || ''}`} onClick={() => checkAnswer(i, oi)}>
                  {vocab[oi].zh}
                </button>
              ))}
            </div>
            <div className="quiz-feedback">{quizFeedback[i] || ''}</div>
          </div>
        </div>
      </SwiperSlide>
    );
  });
  } // end quiz mode

  const handleReturnToMap = () => {
    if (mode === 'vocab') {
      markAllVocabLearned();
    } else if (mode === 'grammar') {
      markGrammarCompleted();
    } else if (mode === 'quiz') {
      markCompleted();
    }
    router.push(`/chapter/${data.chapterNum}`);
  };

  if (mode !== 'all') {
    slides.push(
      <SwiperSlide key="end-of-section">
        <div className="quiz-divider-box">
          <div className="quiz-title">ยอดเยี่ยม! 🎉</div>
          <div className="quiz-subtitle">คุณเรียนจบส่วนนี้แล้ว กลับไปที่แผนที่เพื่อลุยด่านต่อไปเลย!</div>
          <button 
            onClick={handleReturnToMap}
            className="quiz-start-btn" 
            style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-block' }}>
            ⬅️ กลับแผนที่บทเรียน
          </button>
        </div>
      </SwiperSlide>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      <Background chapterNum={data.chapterNum} />

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressWidth}%` }} />
      </div>

      <div className={`achievement${achievementShow ? ' show' : ''}`}>
        <span className="emoji">🎉</span>
        <div>{achievementText}</div>
      </div>

      <div className="counter-display" style={{ display: sectionMode === 'vocab' ? 'flex' : 'none' }}>
        <span className="emoji">⭐</span>
        <span className="count">{learnedCount}/{TOTAL}</span>
      </div>

      <div className="quiz-score" style={{ display: sectionMode === 'quiz' ? 'flex' : 'none' }}>
        <span className="emoji">🏆</span>
        <span className="count">{quizScore}/{TOTAL}</span>
      </div>

      <div
        className={`section-label ${sectionMode === 'quiz' ? 'quiz' : 'vocab'}`}
        style={{
          display: sectionMode === 'intro' ? 'none' : undefined,
          background: sectionMode === 'grammar' ? '#4caf50' : undefined,
        }}
      >
        {sectionLabelText}
      </div>

      <Link 
        className="home-btn" 
        href={mode === 'all' ? "/" : `/chapter/${data.chapterNum}`} 
        title={mode === 'all' ? "หน้าหลัก" : "กลับแผนที่บทเรียน"}
      >
        {mode === 'all' ? "🏠" : "⬅️"}
      </Link>

      <Swiper
        modules={[EffectCreative, Pagination, Navigation]}
        effect="creative"
        creativeEffect={{
          prev: { translate: ['-110%', 0, -400], rotate: [0, 0, -12] },
          next: { translate: ['110%', 0, -400], rotate: [0, 0, 12] },
        }}
        pagination={{ clickable: true }}
        navigation={{ nextEl: '.nav-next', prevEl: '.nav-prev' }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        className="swiper"
      >
        {slides}
      </Swiper>

      <div className="nav-btn nav-prev">‹</div>
      <div className="nav-btn nav-next">›</div>
    </>
  );
}

export default function ChapterEngine({ data: serverData, mode = 'all' }: ChapterEngineProps) {
  const { isLoaded, getMergedChapterData } = useAdminData();
  
  if (!isLoaded) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffebee', fontSize: '24px', fontWeight: 'bold', color: '#ff5722' }}>
        กำลังเตรียมบทเรียน...
      </div>
    );
  }
  
  const data = getMergedChapterData(serverData.chapterNum) || serverData;
  return <ChapterEngineContent data={data} mode={mode} />;
}
