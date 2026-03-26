import ChapterEditorClient from '@/components/admin/ChapterEditorClient';

interface ChapterEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChapterEditPage({ params }: ChapterEditPageProps) {
  const { id } = await params;
  return <ChapterEditorClient chapterId={id} />;
}
