import { notFound } from 'next/navigation';
import { getChapterData, chapterList } from '@/data';
import ChapterEngine from '@/components/chapter/ChapterEngine';
import { ChapterPageProps } from '../page';

export function generateStaticParams() {
  return chapterList.map((ch) => ({ id: String(ch.id) }));
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapterId = parseInt(id, 10);
  const data = getChapterData(chapterId);
  if (!data) return { title: 'ไม่พบบทเรียน' };
  return {
    title: `ไวยากรณ์บทที่ ${data.chapterNum} – ${data.titleZh}`,
  };
}

export default async function ChapterGrammarPage({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapterId = parseInt(id, 10);
  const data = getChapterData(chapterId);

  if (!data) {
    notFound();
  }

  // Don't redirect here — grammar may be added via admin (localStorage).
  // ChapterEngine handles the admin-merged data client-side.
  return <ChapterEngine data={data} mode="grammar" />;
}
