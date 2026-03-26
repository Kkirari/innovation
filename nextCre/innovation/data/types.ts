export interface VocabItem {
  zh: string;
  py: string;
  th: string;
  img: string;
}

export interface GrammarItem {
  zh: string;
  py: string;
  th: string;
  roles: string[];
}

export interface ChapterData {
  chapterNum: number;
  chapterLabel: string;
  titleZh: string;
  titleTh: string;
  introBanner: string[];
  vocab: VocabItem[];
  grammar: GrammarItem[];
}

export interface ChapterListItem {
  id: number;
  titleZh: string;
  titleTh: string;
  colorClass: string;
}
