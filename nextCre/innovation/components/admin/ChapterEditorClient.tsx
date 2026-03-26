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

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {isNew ? 'เพิ่มบทเรียนใหม่' : `แก้ไขบทเรียน: บทที่ ${formData.chapterNum}`}
        </h2>
        <button 
          onClick={handleSave}
          style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
        >
          💾 บันทึกข้อมูล
        </button>
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
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 1fr) auto', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>จีน (ZH)</label>
                  <input type="text" value={g.zh} onChange={e => handleGrammarChange(i, 'zh', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>พินอิน (PY)</label>
                  <input type="text" value={g.py} onChange={e => handleGrammarChange(i, 'py', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>ไทย (TH)</label>
                  <input type="text" value={g.th} onChange={e => handleGrammarChange(i, 'th', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>บทบาท (คั่นด้วย Comma)</label>
                  <input type="text" value={g.roles?.join(', ')} onChange={e => handleGrammarChange(i, 'roles', e.target.value)} placeholder="A, B" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db' }} />
                </div>
                <button onClick={() => removeGrammar(i)} style={{ marginTop: '1.2rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>ลบ</button>
              </div>
            ))}
            {(!formData.grammar || formData.grammar.length === 0) && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>ยังไม่มีประโยคไวยากรณ์</div>}
          </div>
        </section>

      </div>
    </div>
  );
}
