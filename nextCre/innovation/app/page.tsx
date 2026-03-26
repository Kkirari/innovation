import Header from '@/components/home/Header';
import ChapterListClient from '@/components/home/ChapterListClient';
import '@/styles/home.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="page">
        <Header />
        <ChapterListClient />
        <div className="footer-note">
          กดที่บทเรียนเพื่อเริ่มต้นเรียนรู้ · 点击章节开始学习
        </div>
      </div>
    </div>
  );
}
