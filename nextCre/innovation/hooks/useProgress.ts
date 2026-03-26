'use client';

import { useState, useCallback, useEffect } from 'react';

/* ============================================================
   PROGRESS SYSTEM — useProgress hook
   Persists learning progress to localStorage per chapter:
   - Learned vocab indices
   - Quiz score (best)
   - Chapter completion status
   ============================================================ */

const STORAGE_KEY = 'chinese-learning-progress';

export interface ChapterProgress {
  learnedVocab: number[];    // indices of learned vocab words
  grammarCompleted?: boolean;// true if grammar and roleplay are done
  quizScore: number;         // best quiz score
  quizTotal: number;         // total quiz questions
  completed: boolean;        // true if all vocab learned and quiz done
}

export interface AllProgress {
  chapters: Record<number, ChapterProgress>;
}

function loadProgress(): AllProgress {
  if (typeof window === 'undefined') return { chapters: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return { chapters: {} };
}

function saveProgress(progress: AllProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore quota errors */ }
}

export function clearAllProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getAllProgress(): AllProgress {
  return loadProgress();
}

export function getChapterProgress(chapterId: number): ChapterProgress | null {
  const all = loadProgress();
  return all.chapters[chapterId] || null;
}

/* ============================================================
   useChapterProgress — hook for use inside a chapter
   ============================================================ */
export function useChapterProgress(chapterId: number, totalVocab: number) {
  const [progress, setProgress] = useState<ChapterProgress>(() => {
    const saved = getChapterProgress(chapterId);
    return saved || { learnedVocab: [], quizScore: 0, quizTotal: totalVocab, completed: false };
  });

  // Load from localStorage on mount (client side)
  useEffect(() => {
    const saved = getChapterProgress(chapterId);
    if (saved) setProgress(saved);
  }, [chapterId]);

  // Save whenever progress changes
  const save = useCallback((updated: ChapterProgress) => {
    const all = loadProgress();
    all.chapters[chapterId] = updated;
    saveProgress(all);
  }, [chapterId]);

  const markVocabLearned = useCallback((vocabIndex: number) => {
    setProgress(prev => {
      if (prev.learnedVocab.includes(vocabIndex)) return prev;
      const updated = {
        ...prev,
        learnedVocab: [...prev.learnedVocab, vocabIndex],
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const updateQuizScore = useCallback((score: number) => {
    setProgress(prev => {
      const newBest = Math.max(prev.quizScore, score);
      const isComplete = prev.learnedVocab.length >= totalVocab;
      const updated = {
        ...prev,
        quizScore: newBest,
        quizTotal: totalVocab,
        completed: isComplete && score > 0,
      };
      save(updated);
      return updated;
    });
  }, [save, totalVocab]);

  const markCompleted = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, completed: true };
      save(updated);
      return updated;
    });
  }, [save]);

  const markGrammarCompleted = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, grammarCompleted: true };
      save(updated);
      return updated;
    });
  }, [save]);

  const markAllVocabLearned = useCallback(() => {
    setProgress(prev => {
      const allIndices = Array.from({ length: totalVocab }, (_, i) => i);
      const updated = { ...prev, learnedVocab: allIndices };
      save(updated);
      return updated;
    });
  }, [save, totalVocab]);

  return {
    progress,
    markVocabLearned,
    markAllVocabLearned,
    updateQuizScore,
    markCompleted,
    markGrammarCompleted,
    learnedCount: progress.learnedVocab.length,
    isVocabLearned: (index: number) => progress.learnedVocab.includes(index),
  };
}

/* ============================================================
   useAllProgress — hook for homepage
   ============================================================ */
export function useAllProgress() {
  const [allProgress, setAllProgress] = useState<AllProgress>({ chapters: {} });

  useEffect(() => {
    setAllProgress(loadProgress());
  }, []);

  const clearData = useCallback(() => {
    clearAllProgress();
    setAllProgress({ chapters: {} });
  }, []);

  const refresh = useCallback(() => {
    setAllProgress(loadProgress());
  }, []);

  return { allProgress, clearData, refresh };
}
