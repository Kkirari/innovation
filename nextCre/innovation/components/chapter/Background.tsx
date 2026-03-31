'use client';

import { getChapterTheme } from '@/data/chapterThemes';

interface BackgroundProps {
  chapterNum?: number;
}

export default function Background({ chapterNum = 1 }: BackgroundProps) {
  const theme = getChapterTheme(chapterNum);

  return (
    <>
      {/* Sky gradient background with stars */}
      <div
        className={`bg-container bg-theme-${theme.themeClass}`}
        style={{ background: theme.skyGradient }}
      />

      {/* Moon (conditional) */}
      {theme.showMoon && <div className="moon" />}

      {/* Clouds (conditional, with optional tint) */}
      {theme.showClouds && (
        <>
          <div className="cloud c1" style={theme.cloudTint ? { background: theme.cloudTint } : {}} />
          <div className="cloud c2" style={theme.cloudTint ? { background: theme.cloudTint } : {}} />
          <div className="cloud c3" style={theme.cloudTint ? { background: theme.cloudTint } : {}} />
          <div className="cloud c4" style={theme.cloudTint ? { background: theme.cloudTint } : {}} />
        </>
      )}

      {/* Floating decoration emojis */}
      {theme.floatingEmojis.length > 0 && (
        <div className="floating-decor">
          {theme.floatingEmojis.map((emoji, i) => (
            <span key={i} className={`float-emoji fe-${i + 1}`}>{emoji}</span>
          ))}
        </div>
      )}

      {/* Ground elements — per chapter type */}
      {theme.groundType === 'rail' && (
        <div className="rail-track">
          <div className="rail-ties" />
          <div className="rail-left" />
          <div className="rail-right" />
          <div className="rail-ground" />
        </div>
      )}

      {theme.groundType === 'road' && (
        <div className="ground-road">
          <div className="road-surface" />
          <div className="road-dashes" />
          <div className="sidewalk" />
          <div className="lamppost lp1"><div className="lamp-light" /></div>
          <div className="lamppost lp2"><div className="lamp-light" /></div>
        </div>
      )}

      {theme.groundType === 'pixel' && (
        <div className="ground-pixel">
          <div className="pixel-blocks" />
          <div className="pixel-glow" />
          <div className="pixel-stars">
            <span className="px-star s1">✦</span>
            <span className="px-star s2">✧</span>
            <span className="px-star s3">✦</span>
            <span className="px-star s4">✧</span>
          </div>
        </div>
      )}

      {theme.groundType === 'path' && (
        <div className="ground-path">
          <div className="grass-ground" />
          <div className="stone-path" />
          <div className="sunrise-glow" />
        </div>
      )}

      {theme.groundType === 'wood' && (
        <div className="ground-wood">
          <div className="wood-surface" />
          <div className="steam-puff st1" />
          <div className="steam-puff st2" />
          <div className="steam-puff st3" />
          <div className="hanging-lantern hl1">🏮</div>
          <div className="hanging-lantern hl2">🏮</div>
        </div>
      )}

      {theme.groundType === 'water' && (
        <div className="ground-water">
          <div className="water-surface" />
          <div className="water-ripple wr1" />
          <div className="water-ripple wr2" />
          <div className="water-ripple wr3" />
          <div className="temple-silhouette" />
        </div>
      )}

      {theme.groundType === 'market' && (
        <div className="ground-market">
          <div className="market-awning" />
          <div className="market-counter" />
          <div className="chili-deco cd1">🌶️</div>
          <div className="chili-deco cd2">🌶️</div>
          <div className="chili-deco cd3">🌶️</div>
        </div>
      )}

      {theme.groundType === 'festive' && (
        <div className="ground-festive">
          <div className="festive-ground" />
          <div className="firework fw1" />
          <div className="firework fw2" />
          <div className="firework fw3" />
          <div className="hanging-lantern hl1">🏮</div>
          <div className="hanging-lantern hl2">🏮</div>
          <div className="hanging-lantern hl3">🏮</div>
        </div>
      )}
    </>
  );
}
