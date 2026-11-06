import { Link } from 'react-router-dom';
import type { GemstoneAsset } from '../../assets/manifest';
import { useStudent } from '../../context/StudentContext';
import { achievementProgress, ACTIVITY_GEMS, CATEGORY_NAMES, gemAction } from '../../utils/achievementRules';
import { AchievementDialog } from './AchievementDialog';
import { GemstoneImage, EarnedDate, AchievementMeter } from './AchievementCard';
import { LuniSprite } from '../luni/LuniSprite';

export function AchievementDetailModal({ gem, onClose }: { gem: GemstoneAsset; onClose: () => void }) {
  const { state } = useStudent();
  const p = achievementProgress(gem, state);
  const action = gemAction(gem.id);
  return <AchievementDialog titleId="gem-detail-title" onClose={onClose} reducedMotion={state.preferences.reducedMotion}>
    <div className={`gem-detail gem-category-${gem.category}`}>
      <span className="vault-eyebrow">A gem in your journey</span><GemstoneImage gem={gem} status={p.status} large />
      <div className="gem-detail-badges"><span>{CATEGORY_NAMES[gem.category]}</span><span className={`rarity-badge rarity-${gem.rarity.toLowerCase()}`}>{gem.rarity}</span></div>
      <h2 id="gem-detail-title">{gem.name}</h2><p>{gem.description}</p>
      <div className="gem-detail-requirement"><strong>How to unlock</strong><p>{gem.requirement}</p></div>
      <div className="gem-detail-progress"><strong>{p.status}</strong><span>{p.current} / {p.total} milestones</span></div>
      <AchievementMeter current={p.current} total={p.total} label={`${gem.name} progress`} />
      <p className="gem-hint">{p.record ? <EarnedDate value={p.record.unlockedAt} full /> : p.hint}</p>
      <div className="vault-luni-note"><LuniSprite pose={p.record ? 'love' : 'point'} size={64} animate={false} /><p>{p.record ? "Look at how far you've come! Every small achievement matters!" : "This gemstone is still waiting to shine. Keep exploring and you'll discover how to unlock it!"}</p></div>
      {!p.record && !ACTIVITY_GEMS.has(gem.id) && <Link className="vault-primary-button" to={action.route} onClick={onClose}>{action.label}</Link>}
    </div>
  </AchievementDialog>;
}