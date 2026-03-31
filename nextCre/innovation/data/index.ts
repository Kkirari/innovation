import { ChapterData } from './types';
import { chapterList } from './chapters';
import ch1 from './ch1';
import ch2 from './ch2';
import ch3 from './ch3';
import ch4 from './ch4';
import ch5 from './ch5';
import ch6 from './ch6';
import ch7 from './ch7';
import ch8 from './ch8';

const chapterDataMap: Record<number, ChapterData> = {
  1: ch1,
  2: ch2,
  3: ch3,
  4: ch4,
  5: ch5,
  6: ch6,
  7: ch7,
  8: ch8,
};

const defaultBanners: Record<number, string[]> = {
  1: ['✈️', '⚡', '🚆', '📏', '✏️'],
  2: ['🍞', '🗺️', '🚶', '📍', '🥐'],
  3: ['🎮', '🕹️', '📱', '🎲', '👾'],
  4: ['⏰', '🏃', '⌚', '❓', '😓'],
  5: ['🍜', '🥢', '🥟', '😋', '🍚'],
  6: ['⛵', '🏰', '🗺️', '🛕', '🛶'],
  7: ['🌶️', '🥵', '🍲', '🍋', '😋'],
  8: ['🏮', '🧧', '🐉', '🧨', '🎉']
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
      introBanner: defaultBanners[chapterMeta.id] || ['🚧', '🏗️', '🔜'],
      vocab: [],
      grammar: [],
    };
  }
  
  return null;
}

export { chapterList };
export type { ChapterData, ChapterListItem, VocabItem, GrammarItem } from './types';
