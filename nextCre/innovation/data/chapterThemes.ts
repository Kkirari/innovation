/**
 * Chapter Theme Configuration
 * Each chapter has a unique visual theme matching its topic.
 */

export interface ChapterTheme {
  /** CSS class suffix e.g. 'ch1' */
  themeClass: string;
  /** Background gradient (top to bottom) */
  skyGradient: string;
  /** Ground/bottom element type */
  groundType: 'rail' | 'road' | 'pixel' | 'path' | 'wood' | 'water' | 'market' | 'festive';
  /** Floating decoration emojis */
  floatingEmojis: string[];
  /** Whether to show moon */
  showMoon: boolean;
  /** Whether to show clouds */
  showClouds: boolean;
  /** Cloud tint color (CSS) */
  cloudTint?: string;
}

export const CHAPTER_THEMES: Record<number, ChapterTheme> = {
  // Ch1: 飞机比火车快 — Sky & Rails (original)
  1: {
    themeClass: 'ch1',
    skyGradient: 'linear-gradient(180deg, #0a1628 0%, #0e2a52 38%, #1a4a8a 62%, #3a7bd5 72%, #e87c2a 83%, #f5a623 91%, #ffd04a 100%)',
    groundType: 'rail',
    floatingEmojis: [],
    showMoon: true,
    showClouds: true,
  },
  // Ch2: 面包店怎么走 — City Streets
  2: {
    themeClass: 'ch2',
    skyGradient: 'linear-gradient(180deg, #1a0533 0%, #2d1b69 25%, #e86833 55%, #f4a142 72%, #ffd166 85%, #ffe9b0 100%)',
    groundType: 'road',
    floatingEmojis: ['🍞', '🏪', '🗺️'],
    showMoon: false,
    showClouds: true,
    cloudTint: 'rgba(255,200,150,0.85)',
  },
  // Ch3: 我可以玩儿游戏吗 — Game World
  3: {
    themeClass: 'ch3',
    skyGradient: 'linear-gradient(180deg, #0d0221 0%, #150540 20%, #261168 45%, #3d1d99 65%, #6b3fa0 80%, #9b59b6 100%)',
    groundType: 'pixel',
    floatingEmojis: ['🎮', '🕹️', '⭐'],
    showMoon: false,
    showClouds: false,
  },
  // Ch4: 你为什么迟到 — Morning Rush
  4: {
    themeClass: 'ch4',
    skyGradient: 'linear-gradient(180deg, #1a1a3e 0%, #2e3a6e 20%, #4a6fa5 40%, #7fb5d5 55%, #f0c27f 72%, #fc5c7d 85%, #ffb88c 100%)',
    groundType: 'path',
    floatingEmojis: ['⏰', '📚', '🏫'],
    showMoon: false,
    showClouds: true,
    cloudTint: 'rgba(255,220,200,0.9)',
  },
  // Ch5: 中国菜很好吃 — Chinese Kitchen
  5: {
    themeClass: 'ch5',
    skyGradient: 'linear-gradient(180deg, #1a0000 0%, #4a0e0e 25%, #8b1a1a 48%, #c62828 65%, #e53935 78%, #ff6f00 90%, #ffd54f 100%)',
    groundType: 'wood',
    floatingEmojis: ['🏮', '🥡', '🥟'],
    showMoon: false,
    showClouds: false,
  },
  // Ch6: 我们去大皇宫还是水上市场 — Thai Landmarks
  6: {
    themeClass: 'ch6',
    skyGradient: 'linear-gradient(180deg, #0d1b2a 0%, #1b3a5c 25%, #2980b9 50%, #3498db 65%, #48b1bf 78%, #06beb6 90%, #76d7c4 100%)',
    groundType: 'water',
    floatingEmojis: ['🏛️', '⛵', '🌸'],
    showMoon: true,
    showClouds: true,
    cloudTint: 'rgba(200,230,255,0.85)',
  },
  // Ch7: 泰国菜有点辣 — Spicy Market
  7: {
    themeClass: 'ch7',
    skyGradient: 'linear-gradient(180deg, #1a0a00 0%, #4a1a00 20%, #8b3a0a 42%, #d35400 60%, #e67e22 75%, #f39c12 88%, #f9e076 100%)',
    groundType: 'market',
    floatingEmojis: ['🌶️', '🍜', '🧄'],
    showMoon: false,
    showClouds: false,
  },
  // Ch8: 春节快到了 — Chinese New Year
  8: {
    themeClass: 'ch8',
    skyGradient: 'linear-gradient(180deg, #1a0000 0%, #4a0000 18%, #8b0000 35%, #c0001a 50%, #d32f2f 65%, #e74c3c 78%, #ff6b6b 90%, #ffd700 100%)',
    groundType: 'festive',
    floatingEmojis: ['🧧', '🎆', '🏮'],
    showMoon: true,
    showClouds: false,
  },
};

export function getChapterTheme(chapterNum: number): ChapterTheme {
  return CHAPTER_THEMES[chapterNum] || CHAPTER_THEMES[1];
}
