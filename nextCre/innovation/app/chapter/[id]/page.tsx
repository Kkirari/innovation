import { notFound } from 'next/navigation';
import { getChapterData, chapterList } from '@/data';
import ChapterMapClient from '@/components/chapter/ChapterMapClient';

export interface ChapterPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return chapterList.map((ch) => ({ id: String(ch.id) }));
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapterId = parseInt(id, 10);
  const data = getChapterData(chapterId);
  if (!data) return { title: 'ไม่พบบทเรียน' };
  return {
    title: `${data.titleZh} – แผนที่บทที่ ${data.chapterNum}`,
    description: `${data.titleTh} — สื่อการเรียนรู้ภาษาจีน บทที่ ${data.chapterNum}`,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapterId = parseInt(id, 10);
  const data = getChapterData(chapterId);

  if (!data) {
    notFound();
  }

  return <ChapterMapClient chapterId={id} />;
}
