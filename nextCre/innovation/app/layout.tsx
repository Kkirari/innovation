import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'สื่อการเรียนรู้ภาษาจีน',
  description: '中文学习教材 · สื่อการเรียนรู้ภาษาจีนระดับประถม 6 — 8 บทเรียน',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
