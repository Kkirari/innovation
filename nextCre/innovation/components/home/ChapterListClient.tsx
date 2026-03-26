'use client';

import { useState, useEffect } from 'react';
import { useAllProgress } from '@/hooks/useProgress';
import { useAdminData } from '@/hooks/useAdminData';
import { chapterList as defaultChapterList } from '@/data';
import ChapterCard from '@/components/home/ChapterCard';

export default function ChapterListClient() {
  const { allProgress, clearData } = useAllProgress();
  const { getAllChaptersList, isLoaded } = useAdminData();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const chapters = isLoaded ? getAllChaptersList() : defaultChapterList;

  const handleClear = () => {
    clearData();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            progress={allProgress.chapters[chapter.id] || null}
          />
        ))}
      </div>

      {/* Clear data button */}
      <div className="clear-data-section">
        {!showConfirm ? (
          <button className="clear-data-btn" onClick={() => setShowConfirm(true)}>
            🗑️ ล้างข้อมูลความก้าวหน้า
          </button>
        ) : (
          <div className="clear-confirm">
            <p>ยืนยันลบข้อมูลทั้งหมด?</p>
            <div className="confirm-btns">
              <button className="confirm-yes" onClick={handleClear}>✅ ยืนยัน</button>
              <button className="confirm-no" onClick={() => setShowConfirm(false)}>❌ ยกเลิก</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
