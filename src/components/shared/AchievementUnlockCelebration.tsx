import { useEffect, useState, type CSSProperties } from 'react';
import { GEMSTONE_ASSETS } from '../../assets/manifest';
import { useStudent } from '../../context/StudentContext';
import { LuniSprite } from '../luni/LuniSprite';
import { AchievementDialog } from '../achievements/AchievementDialog';
import { GemstoneImage } from '../achievements/AchievementCard';

// One global queue replaces the separate Track Explorer and Path Compare overlays.
export function AchievementUnlockCelebration() {
  const { state, acknowledgeAchievement } = useStudent();
  const [activeId, setActiveId] = useState<string | null>(null);
  const pendingId = state.achievementRecords.find(r => !r.celebrationAcknowledged)?.id;
  useEffect(() => {
    if (activeId || !pendingId) return;
    if (!state.preferences.notifications) { acknowledgeAchievement(pendingId); return; }
    setActiveId(pendingId);
    // Mark presented immediately; refreshing a shown overlay never replays it.
    acknowledgeAchievement(pendingId);
  }, [activeId, pendingId, acknowledgeAchievement, state.preferences.notifications]);
  const gem = GEMSTONE_ASSETS.find(g => g.achievementId === activeId);
  if (!gem) return null;
  return <AchievementDialog key={gem.achievementId} titleId="gem-celebration-title" onClose={() => setActiveId(null)} reducedMotion={state.preferences.reducedMotion}>
    <div className={`gem-celebration gem-category-${gem.category}`}>
      <div className="vault-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</div>
      <span className="vault-eyebrow">Achievement unlocked</span><GemstoneImage gem={gem} large />
      <span className={`rarity-badge rarity-${gem.rarity.toLowerCase()}`}>{gem.rarity}</span>
      <h2 id="gem-celebration-title">{gem.name}</h2>
      <p role="status" aria-live="polite">{gem.name} has joined your collection!</p>
      <div className="vault-luni-note"><LuniSprite pose="celebrate" size={88} animate={false} /><p>{gem.id === 20 ? "Incredible! You've explored so much of the CTRL+PATH universe!" : 'YOU DID IT! Another beautiful gemstone has joined your collection!'}</p></div>
      <p className="gem-hint">Every gemstone represents progress. Every pathway belongs to you.</p>
      <button className="vault-primary-button" onClick={() => setActiveId(null)}>Continue exploring</button>
    </div>
  </AchievementDialog>;
}
