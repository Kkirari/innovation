'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/hooks/useAdminData';
import { ChapterData, VocabItem, GrammarItem } from '@/data/types';
import { getChapterData } from '@/data';

interface ChapterEditorClientProps {
  chapterId: string;
}

export default function ChapterEditorClient({ chapterId }: ChapterEditorClientProps) {
  const router = useRouter();
  const { isLoaded, getMergedChapterData, saveChapterData } = useAdminData();
  const [formData, setFormData] = useState<ChapterData | null>(null);

  const isNew = chapterId === 'new';

  useEffect(() => {
    if (!isLoaded) return;
    
    if (isNew) {
      // Initialize an empty chapter
      setFormData({
        chapterNum: 999, // default placeholder
        chapterLabel: 'หมวดเรียนรู้',
        titleZh: '',
        titleTh: '',
        introBanner: ['⭐'],
        vocab: [],
        grammar: []
      });
    } else {
      const idNum = parseInt(chapterId, 10);
      const data = getMergedChapterData(idNum);
      if (data) {
        setFormData(JSON.parse(JSON.stringify(data))); // deep clone
      } else {
        alert('ไม่พบบทเรียน');
        router.push('/admin');
      }
    }
  }, [isLoaded, chapterId, getMergedChapterData, isNew, router]);

  if (!isLoaded || !formData) return <div>กำลังโหลดแบบฟอร์ม...</div>;

  const handleSave = () => {
    saveChapterData(formData.chapterNum, formData);
    alert('บันทึกเรียบร้อย!');
    router.push('/admin');
  };

  const handleVocabChange = (index: number, field: keyof VocabItem, value: string) => {
    const newVocab = [...formData.vocab];
    newVocab[index] = { ...newVocab[index], [field]: value };
    setFormData({ ...formData, vocab: newVocab });
  };

  const addVocab = () => {
    setFormData({
      ...formData,
      vocab: [...formData.vocab, { zh: '', py: '', th: '', img: 'example.png' }]
    });
  };

  const removeVocab = (index: number) => {
    const newVocab = [...formData.vocab];
    newVocab.splice(index, 1);
    setFormData({ ...formData, vocab: newVocab });
  };

  const handleGrammarChange = (index: number, field: keyof GrammarItem, value: string) => {
    const newGrammar = [...formData.grammar];
    if (field === 'roles') {
      newGrammar[index].roles = value.split(',').map(s => s.trim());
    } else {
      newGrammar[index] = { ...newGrammar[index], [field]: value };
    }
    setFormData({ ...formData, grammar: newGrammar });
  };

  const addGrammar = () => {
    const newGrammarArray = formData.grammar ? [...formData.grammar] : [];
    newGrammarArray.push({ zh: '', py: '', th: '', roles: ['A', 'B'] });
    setFormData({ ...formData, grammar: newGrammarArray });
  };

  const removeGrammar = (index: number) => {
    const newGrammar = [...formData.grammar];
    newGrammar.splice(index, 1);
    setFormData({ ...formData, grammar: newGrammar });
  };

  const handleExport = () => {
    const exportCode = `import { ChapterData } from './types';\n\nconst ch${formData.chapterNum}: ChapterData = ${JSON.stringify(formData, null, 2)};\n\nexport default ch${formData.chapterNum};`;
    console.log("=== EXPORTED CHAPTER DATA ===");
    console.log(exportCode);
    console.log("=============================");
    try {
      navigator.clipboard.writeText(exportCode);
      alert('คัดลอกโค้ดลง Clipboard และพ่น Log ใน Console (F12) แล้วครับ! นำไปแปะในไฟล์ data ได้เลย');
    } catch {
      alert('พ่นโค้ด (Log) ใน Console (F12) แล้วครับ!');
    }
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {isNew ? 'เพิ่มบทเรียนใหม่' : `แก้ไขบทเรียน: บทที่ ${formData.chapterNum}`}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleExport}
            style={{ backgroundColor: '#4b5563', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            📋 Log & Copy ข้อมูล
          </button>
          <button 
            onClick={handleSave}
            style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            💾 บันทึก
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* === META SECTION === */}
        <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>ข้อมูลทั่วไป</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {isNew && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รหัสบทเรียน (ตัวเลข)</label>
                <input 
                  type="number" 
                  value={formData.chapterNum} 
                  onChange={e => setFormData({ ...formData, chapterNum: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ประเภท/หมวดการเรียน</label>
              <input 
                type="text" 
                value={formData.chapterLabel} 
                onChange={e => setFormData({ ...formData, chapterLabel: e.target.value })}
                placeholder="เช่น 📖 บทเรียน หรือ 🏆 หมวดท้าทาย"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ชื่อบท (ภาษาจีน)</label>
              <input 
                type="text" 
                value={formData.titleZh} 
                onChange={e => setFormData({ ...formData, titleZh: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ชื่อบท (ภาษาไทย)</label>
              <input 
                type="text" 
                value={formData.titleTh} 
                onChange={e => setFormData({ ...formData, titleTh: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              />
            </div>
          </div>
        </section>

        {/* === VOCAB SECTION === */}
        <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>หน้าคำศัพท์ ({formData.vocab.length} คำ)</h3>
            <button onClick={addVocab} style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>+ เพิ่มคำศัพท์</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formData.vocab.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>จีน (ZH)</label>
                  <input type="text" value={v.zh} onChange={e => handleVocabChange(i, 'zh', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>พินอิน (PY)</label>
                  <input type="text" value={v.py} onChange={e => handleVocabChange(i, 'py', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ไทย (TH)</label>
                  <input type="text" value={v.th} onChange={e => handleVocabChange(i, 'th', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ชื่อรูปภาพ (.png)</label>
                  <input type="text" value={v.img} onChange={e => handleVocabChange(i, 'img', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <button onClick={() => removeVocab(i)} style={{ marginTop: '1.2rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>ลบ</button>
              </div>
            ))}
            {formData.vocab.length === 0 && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>ยังไม่มีคำศัพท์</div>}
          </div>
        </section>

        {/* === GRAMMAR SECTION === */}
        <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>หน้าไวยากรณ์ & ประโยค ({formData.grammar?.length || 0} ประโยค)</h3>
            <button onClick={addGrammar} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>+ เพิ่มประโยค</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(formData.grammar || []).map((g, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#374151' }}>ประโยคที่ {i + 1}</span>
                  <button onClick={() => removeGrammar(i)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}>ลบ</button>
                </div>
                
                {/* Person A or Single Sentence */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 'bold' }}>ประโยคหลัก / A (ZH)</label>
                    <input type="text" value={g.zh} onChange={e => handleGrammarChange(i, 'zh', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>พินอิน (PY)</label>
                    <input type="text" value={g.py} onChange={e => handleGrammarChange(i, 'py', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ไทย (TH)</label>
                    <input type="text" value={g.th} onChange={e => handleGrammarChange(i, 'th', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>บทบาท (Roleplay: A, B)</label>
                    <input type="text" value={g.roles?.join(', ')} onChange={e => handleGrammarChange(i, 'roles', e.target.value)} placeholder="A, B" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                </div>

                {/* Person B (Optional) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'end', marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '3px solid #fbcfe8' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#be185d', fontWeight: 'bold' }}>ประโยคตอบกลับ / B (ZH)</label>
                    <input type="text" value={g.bZh || ''} onChange={e => handleGrammarChange(i, 'bZh', e.target.value)} placeholder="(เว้นว่างถ้าเป็นประโยคเดี่ยว)" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>พินอิน (PY)</label>
                    <input type="text" value={g.bPy || ''} onChange={e => handleGrammarChange(i, 'bPy', e.target.value)} placeholder="พินอินประโยค B" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ไทย (TH)</label>
                    <input type="text" value={g.bTh || ''} onChange={e => handleGrammarChange(i, 'bTh', e.target.value)} placeholder="คำแปลประโยค B" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                  </div>
                </div>

                {/* Additional Dialogue Lines (Lines 3+) */}
                {g.dialogues && g.dialogues.length > 0 && (
                  <div style={{ marginTop: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #d8b4fe', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#7e22ce', marginBottom: '0.5rem' }}>💬 ประโยคสนทนาเพิ่มเติม (บรรทัดที่ 3 ขึ้นไป)</div>
                    {g.dialogues.map((dl, dIdx) => (
                      <div key={dIdx} style={{ display: 'grid', gridTemplateColumns: '80px minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.5fr) auto', gap: '0.5rem', alignItems: 'end', background: '#faf5ff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e9d5ff' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: 'bold' }}>ผู้พูด</label>
                          <input type="text" value={dl.speaker} onChange={e => {
                            const newGrammar = [...formData.grammar];
                            newGrammar[i].dialogues![dIdx].speaker = e.target.value;
                            setFormData({ ...formData, grammar: newGrammar });
                          }} placeholder="เช่น A" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>จีน (ZH)</label>
                          <input type="text" value={dl.zh} onChange={e => {
                            const newGrammar = [...formData.grammar];
                            newGrammar[i].dialogues![dIdx].zh = e.target.value;
                            setFormData({ ...formData, grammar: newGrammar });
                          }} placeholder="ประโยคจีน" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>พินอิน (PY)</label>
                          <input type="text" value={dl.py} onChange={e => {
                            const newGrammar = [...formData.grammar];
                            newGrammar[i].dialogues![dIdx].py = e.target.value;
                            setFormData({ ...formData, grammar: newGrammar });
                          }} placeholder="พินอิน" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ไทย (TH)</label>
                          <input type="text" value={dl.th} onChange={e => {
                            const newGrammar = [...formData.grammar];
                            newGrammar[i].dialogues![dIdx].th = e.target.value;
                            setFormData({ ...formData, grammar: newGrammar });
                          }} placeholder="คำแปล" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                        </div>
                        <button onClick={() => {
                          const newGrammar = [...formData.grammar];
                          newGrammar[i].dialogues!.splice(dIdx, 1);
                          setFormData({ ...formData, grammar: newGrammar });
                        }} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>ลบ</button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                   <button onClick={() => {
                     const newGrammar = [...formData.grammar];
                     if (!newGrammar[i].dialogues) newGrammar[i].dialogues = [];
                     const nextSpeaker = newGrammar[i].dialogues!.length % 2 === 0 ? (g.roles?.[0] || 'A') : (g.roles?.[1] || 'B');
                     newGrammar[i].dialogues!.push({ speaker: nextSpeaker, zh: '', py: '', th: '' });
                     setFormData({ ...formData, grammar: newGrammar });
                   }} style={{ backgroundColor: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}>+ เพิ่มประโยคสนทนาโต้ตอบ (บรรทัดต่อไป)</button>
                </div>
              </div>
            ))}
            {(!formData.grammar || formData.grammar.length === 0) && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>ยังไม่มีประโยคไวยากรณ์</div>}
          </div>
        </section>

        {/* === ROLEPLAY TOGGLE === */}
        <div style={{ backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input 
            type="checkbox" 
            id="showRoleplay"
            checked={formData.showRoleplay !== false}
            onChange={e => setFormData({ ...formData, showRoleplay: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label htmlFor="showRoleplay" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
            🎭 แสดงหน้าสุ่มประโยค (Roleplay) ในไวยากรณ์
          </label>
        </div>
        {/* === GRAMMAR IMAGES SECTION === */}
        <section style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>🖼️ รูปภาพสุ่ม (สำหรับฝึกพูด) ({formData.grammarImages?.length || 0} รูป)</h3>
            <button onClick={() => {
              const imgs = formData.grammarImages ? [...formData.grammarImages] : [];
              imgs.push('');
              setFormData({ ...formData, grammarImages: imgs });
            }} style={{ backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>+ เพิ่มรูปภาพ</button>
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
            ใส่ชื่อไฟล์รูปภาพ (เช่น sec2/bakery.jpg) ที่อยู่ในโฟลเดอร์ <code>public/images/</code> — รูปจะถูกสุ่มแสดงในหน้า &quot;สุ่มรูปภาพ&quot; ของไวยากรณ์
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(formData.grammarImages || []).map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ชื่อไฟล์รูปภาพ #{i + 1}</label>
                  <input 
                    type="text" 
                    value={img} 
                    onChange={e => {
                      const imgs = [...(formData.grammarImages || [])];
                      imgs[i] = e.target.value;
                      setFormData({ ...formData, grammarImages: imgs });
                    }} 
                    placeholder="เช่น sec2/bakery.jpg"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} 
                  />
                </div>
                {img && (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/${img}`} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <button 
                  onClick={() => {
                    const imgs = [...(formData.grammarImages || [])];
                    imgs.splice(i, 1);
                    setFormData({ ...formData, grammarImages: imgs });
                  }} 
                  style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>ลบ</button>
              </div>
            ))}
            {(!formData.grammarImages || formData.grammarImages.length === 0) && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>ยังไม่มีรูปภาพสุ่ม — เพิ่มรูปเพื่อเปิดใช้ฟีเจอร์ &quot;สุ่มรูปภาพ&quot;</div>}
          </div>
        </section>

      </div>
    </div>
  );
}
