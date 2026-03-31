export interface VocabItem {
  zh: string;
  py: string;
  th: string;
  img: string;
}

export interface DialogLine {
  speaker: string;
  zh: string;
  py: string;
  th: string;
}

export interface GrammarItem {
  zh: string;
  py: string;
  th: string;
  roles: string[];
  bZh?: string;
  bPy?: string;
  bTh?: string;
  dialogues?: DialogLine[];
}

export interface ChapterData {
  chapterNum: number;
  chapterLabel: string;
  titleZh: string;
  titleTh: string;
  introBanner: string[];
  vocab: VocabItem[];
  grammar: GrammarItem[];
  grammarImages?: string[];
  showRoleplay?: boolean; // default true
}

export interface ChapterListItem {
  id: number;
  titleZh: string;
  titleTh: string;
  colorClass: string;
}
