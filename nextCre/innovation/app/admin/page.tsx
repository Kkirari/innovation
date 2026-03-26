'use client';

import { useAdminData } from '@/hooks/useAdminData';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isLoaded, getAllChaptersList, resetChapterData } = useAdminData();

  if (!isLoaded) return <div>โหลดข้อมูล...</div>;

  const chapters = getAllChaptersList();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📚 การเรียนการสอน</h2>
        <Link 
          href={`/admin/chapter/new`}
          style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500' }}>
          + เพิ่มบทเรียนใหม่
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {chapters.map(ch => (
          <div key={ch.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>บทที่ {ch.id}</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>{ch.titleZh}</h3>
            <div style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{ch.titleTh}</div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link 
                href={`/admin/chapter/${ch.id}`}
                style={{ flex: 1, textAlign: 'center', backgroundColor: '#3b82f6', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem', textDecoration: 'none', fontSize: '0.875rem' }}>
                ✏️ แก้ไขเนื้อหา
              </Link>
              <button 
                onClick={() => {
                  if (confirm(`ตั้งค่าบทที่ ${ch.id} คืนค่าเริ่มต้น/ลบข้อมูล?`)) {
                    resetChapterData(ch.id);
                  }
                }}
                style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}>
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
