'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Background from '@/components/chapter/Background';
import { useAdminData } from '@/hooks/useAdminData';
import { useChapterProgress } from '@/hooks/useProgress';
import '@/styles/chapter.css';

export default function ChapterMapClient({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const { isLoaded, getMergedChapterData } = useAdminData();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (isLoaded) {
      const fetched = getMergedChapterData(parseInt(chapterId, 10));
      if (fetched) setData(fetched);
      else router.push('/');
    }
  }, [isLoaded, chapterId, getMergedChapterData, router]);

  // Hook must be called conditionally on logic, but since we can't early return before hooks,
  // we use a safe fallback totalVocab until data loads.
  const totalVocab = data?.vocab?.length || 0;
  const { learnedCount, progress } = useChapterProgress(parseInt(chapterId, 10), totalVocab);

  if (!isLoaded || !data) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffebee', fontSize: '24px', fontWeight: 'bold' }}>กำลังโหลดแผนที่...</div>;
  }

  const hasGrammar = data.grammar && data.grammar.length > 0;
  const vocabDone = learnedCount >= totalVocab && totalVocab > 0;
  const grammarDone = progress.grammarCompleted;
  
  // Logic for unlocking (sequential: vocab → quiz → grammar)
  const quizUnlocked = vocabDone;
  const grammarUnlocked = progress.completed; // quiz must be done first

  return (
    <>
      <Background chapterNum={parseInt(chapterId, 10)} />

      <Link className="home-btn" href="/" title="หน้าหลัก" style={{ position: 'fixed', top: '14px', left: '20px', zIndex: 100, textDecoration: 'none', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
        🏠
      </Link>

      <div style={{ position: 'relative', zIndex: 10, padding: '80px 20px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div className="chapter-badge" style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 30px', borderRadius: '100px', backdropFilter: 'blur(10px)', color: 'white', fontWeight: 'bold', fontSize: '24px', border: '3px solid rgba(255,255,255,0.5)', marginBottom: '20px', textAlign: 'center' }}>
          แผนที่: บทที่ {data.chapterNum}
        </div>
        
        <h1 style={{ fontSize: '48px', color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.3)', marginBottom: '40px', textAlign: 'center', fontFamily: '"Kaiti", "STKaiti", "KaiTi", serif' }}>
          {data.titleZh}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '400px' }}>
          
          {/* STAGE 1: VOCAB */}
          <Link href={`/chapter/${data.chapterNum}/vocab`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ background: 'linear-gradient(135deg, #2196f3, #0d47a1)', border: '4px solid white', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(33,150,243,0.5)', transform: 'scale(1)', transition: 'transform 0.2s' }}>
              <div style={{ fontSize: '40px', background: 'white', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)' }}>
                📖
              </div>
              <div style={{ color: 'white', flex: 1 }}>
                <h3 style={{ fontSize: '24px', margin: 0 }}>เรียนคำศัพท์</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>{learnedCount} / {totalVocab} คำ</p>
              </div>
              {vocabDone && <div style={{ fontSize: '24px' }}>✅</div>}
            </div>
          </Link>

          {/* STAGE 2: QUIZ (ทดสอบคำศัพท์) */}
          {quizUnlocked ? (
            <Link href={`/chapter/${data.chapterNum}/quiz`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'linear-gradient(135deg, #ff8c00, #d84315)', border: '4px solid white', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(255,140,0,0.5)' }}>
                <div style={{ fontSize: '40px', background: 'white', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)' }}>
                  🏆
                </div>
                <div style={{ color: 'white', flex: 1 }}>
                  <h3 style={{ fontSize: '24px', margin: 0 }}>ทดสอบคำศัพท์</h3>
                  {progress.quizScore > 0 && <p style={{ margin: 0, opacity: 0.9 }}>คะแนนสูงสุด: {progress.quizScore}</p>}
                </div>
                {progress.completed && <div style={{ fontSize: '24px' }}>✅</div>}
              </div>
            </Link>
          ) : (
            <div style={{ background: '#9e9e9e', border: '4px solid #e0e0e0', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', opacity: 0.8 }}>
              <div style={{ fontSize: '40px', background: '#ccc', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔒
              </div>
              <div style={{ color: 'white', flex: 1 }}>
                <h3 style={{ fontSize: '24px', margin: 0 }}>ทดสอบคำศัพท์</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>ต้องเรียนคำศัพท์ให้ครบก่อน</p>
              </div>
            </div>
          )}

          {/* STAGE 3: GRAMMAR (if exists) */}
          {hasGrammar && (
            grammarUnlocked ? (
              <Link href={`/chapter/${data.chapterNum}/grammar`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: 'linear-gradient(135deg, #4caf50, #1b5e20)', border: '4px solid white', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(76,175,80,0.5)' }}>
                  <div style={{ fontSize: '40px', background: 'white', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)' }}>
                    📘
                  </div>
                  <div style={{ color: 'white', flex: 1 }}>
                    <h3 style={{ fontSize: '24px', margin: 0 }}>ไวยากรณ์และประโยค</h3>
                  </div>
                  {grammarDone && <div style={{ fontSize: '24px' }}>✅</div>}
                </div>
              </Link>
            ) : (
              <div style={{ background: '#9e9e9e', border: '4px solid #e0e0e0', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', opacity: 0.8 }}>
                <div style={{ fontSize: '40px', background: '#ccc', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔒
                </div>
                <div style={{ color: 'white', flex: 1 }}>
                  <h3 style={{ fontSize: '24px', margin: 0 }}>ไวยากรณ์และประโยค</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>ต้องเรียนคำศัพท์ให้ครบก่อน</p>
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
}
