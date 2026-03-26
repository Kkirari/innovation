import { ChapterData } from './types';
import { chapterList } from './chapters';
import ch1 from './ch1';

const chapterDataMap: Record<number, ChapterData> = {
  1: ch1,
};

export function getChapterData(id: number): ChapterData | null {
  if (chapterDataMap[id]) return chapterDataMap[id];
  
  const chapterMeta = chapterList.find(c => c.id === id);
  if (chapterMeta) {
    return {
      chapterNum: chapterMeta.id,
      chapterLabel: `บทที่ ${chapterMeta.id}`,
      titleZh: chapterMeta.titleZh,
      titleTh: chapterMeta.titleTh,
      introBanner: ['🚧', '🏗️', '🔜'],
      vocab: [],
      grammar: [],
    };
  }
  
  return null;
}

export { chapterList };
export type { ChapterData, ChapterListItem, VocabItem, GrammarItem } from './types';
