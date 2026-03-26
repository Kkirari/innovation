'use client';

import Link from 'next/link';
import { ChapterListItem } from '@/data/types';
import { ChapterProgress } from '@/hooks/useProgress';

interface ChapterCardProps {
  chapter: ChapterListItem;
  progress?: ChapterProgress | null;
}

export default function ChapterCard({ chapter, progress }: ChapterCardProps) {
  const vocabLearned = progress?.learnedVocab?.length || 0;
  const quizBest = progress?.quizScore || 0;
  const quizTotal = progress?.quizTotal || 0;
  const hasProgress = vocabLearned > 0 || quizBest > 0;

  return (
    <Link
      href={`/chapter/${chapter.id}`}
      className={`chapter-card ${chapter.colorClass}`}
    >
      <div className="num-badge">
        {progress?.completed ? '✅' : chapter.id}
      </div>
      <div className="chapter-text">
        <div className="zh">{chapter.titleZh}</div>
        <div className="th">{chapter.titleTh}</div>
        {hasProgress && (
          <div className="progress-info">
            <span>⭐ {vocabLearned} คำ</span>
            {quizBest > 0 && <span>🏆 {quizBest}/{quizTotal}</span>}
          </div>
        )}
      </div>
      <div className="arrow">›</div>
    </Link>
  );
}
