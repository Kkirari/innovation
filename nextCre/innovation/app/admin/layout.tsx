import React from 'react';
import Link from 'next/link';
import '@/app/globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#f9fafb', color: '#333', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
          🛠️ ระบบจัดการแอดมิน (Admin Dashboard)
        </h1>
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
          ← กลับหน้าหลัก
        </Link>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
