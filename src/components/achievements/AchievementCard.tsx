import { useState, type CSSProperties } from 'react';
import { CheckCircle2, Lock, Clock3, Sparkles } from 'lucide-react';
import type { GemstoneAsset } from '../../assets/manifest';
import type { StudentState } from '../../types';
import { achievementProgress, CATEGORY_NAMES } from '../../utils/achievementRules';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  SpecialAchievementBadge,
} from '../shared/PixelArt';

const EPIC_SPARKLE_POINTS = [
  { top: '14%', left: '16%', size: 9, delay: '0s', dur: '2.2s' },
  { top: '18%', right: '15%', size: 11, delay: '0.45s', dur: '2.4s' },
  { bottom: '20%', left: '20%', size: 8, delay: '0.9s', dur: '2.1s' },
  { bottom: '16%', right: '18%', size: 10, delay: '1.35s', dur: '2.5s' },
] as const;

const LEGENDARY_SPARKLE_POINTS = [
  { top: '10%', left: '14%', size: 11, delay: '0s', dur: '2s' },
  { top: '14%', right: '14%', size: 12, delay: '0.35s', dur: '2.2s' },
  { top: '44%', left: '8%', size: 9, delay: '0.7s', dur: '2.4s' },
  { top: '42%', right: '9%', size: 9, delay: '1.05s', dur: '2.1s' },
  { bottom: '14%', left: '18%', size: 11, delay: '1.4s', dur: '2.3s' },
  { bottom: '12%', right: '16%', size: 12, delay: '1.75s', dur: '1.9s' },
] as const;

export function RaritySparkles({
  rarity,
  unlocked = true,
  className = '',
}: {
  rarity: GemstoneAsset['rarity'];
  unlocked?: boolean;
  className?: string;
}) {
  if (rarity !== 'Epic' && rarity !== 'Legendary') return null;
  const points = rarity === 'Legendary' ? LEGENDARY_SPARKLE_POINTS : EPIC_SPARKLE_POINTS;
  return (
    <span
      aria-hidden="true"
      className={`gem-rarity-sparkles is-${rarity.toLowerCase()} ${unlocked ? 'is-unlocked' : 'is-locked'} ${className}`.trim()}
    >
      {points.map((pt, idx) => (
        <i
          key={idx}
          className="gem-sparkle-star"
          style={
            {
              ...('top' in pt ? { top: pt.top } : {}),
              ...('bottom' in pt ? { bottom: pt.bottom } : {}),
              ...('left' in pt ? { left: pt.left } : {}),
              ...('right' in pt ? { right: pt.right } : {}),
              '--sparkle-size': `${pt.size}px`,
              '--sparkle-delay': pt.delay,
              '--sparkle-dur': pt.dur,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

function CategoryLogo({ category }: { category: GemstoneAsset['category'] }) {
  if (category === 'NT') return <NtTrackBadge size={18} className="shrink-0" />;
  if (category === 'BA') return <BaTrackBadge size={18} className="shrink-0" />;
  if (category === 'SM') return <SmTrackBadge size={18} className="shrink-0" />;
  return <SpecialAchievementBadge size={18} className="shrink-0" />;
}

export function GemstoneImage({ gem, status = 'Unlocked', large = false }: { gem: GemstoneAsset; status?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="gem-image-fallback">{gem.name}<br />Artwork unavailable</span> :
    <img src={gem.url} alt={`${gem.name} gemstone`} width={large ? 160 : 96} height={large ? 160 : 96}
      loading={large ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)}
      className={`gem-art ${large ? 'gem-art-large' : ''} ${status === 'Locked' ? 'gem-locked' : status === 'In Progress' ? 'gem-progress' : 'gem-earned'}`} />;
}
export function EarnedDate({ value, full = false }: { value: string | null; full?: boolean }) {
  return value ? <time dateTime={value}>{new Date(value).toLocaleString(undefined, full ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })}</time> : <>Earned previously · date unavailable</>;
}
export function AchievementMeter({ current, total, label }: { current: number; total: number; label: string }) {
  return <div className="gem-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}><span style={{ width: `${current / total * 100}%` }} /></div>;
}
export function AchievementCard({ gem, state, onSelect }: { gem: GemstoneAsset; state: StudentState; onSelect: () => void }) {
  const progress = achievementProgress(gem, state);
  const Icon = progress.status === 'Unlocked' ? CheckCircle2 : progress.status === 'In Progress' ? Clock3 : Lock;
  const hasSparkleRarity = gem.rarity === 'Epic' || gem.rarity === 'Legendary';
  return <button type="button" className={`gem-card gem-category-${gem.category} is-rarity-${gem.rarity.toLowerCase()} ${progress.record ? 'is-earned' : ''}`} onClick={onSelect} aria-label={`${gem.name}, ${progress.status}. View details`}>
    <span className="gem-card-status"><Icon size={14} />{progress.record && !progress.record.celebrationAcknowledged ? 'Newly Unlocked' : progress.status}</span>
    <span className="gem-art-stage">
      <RaritySparkles rarity={gem.rarity} unlocked={Boolean(progress.record)} />
      <GemstoneImage gem={gem} status={progress.status} />
    </span>
    <span className={`rarity-badge rarity-${gem.rarity.toLowerCase()}`}>
      {hasSparkleRarity && <Sparkles size={11} aria-hidden="true" />}
      <span>{gem.rarity}</span>
    </span>
    <span className="gem-card-title">{gem.name}</span>
    <span className="gem-category-label">
      <span aria-hidden="true" className="gem-category-logo"><CategoryLogo category={gem.category} /></span>
      <span>{CATEGORY_NAMES[gem.category]}</span>
    </span>
    <span className="gem-description">{gem.description}</span>
    <span className="gem-requirement"><strong>To unlock</strong>{gem.requirement}</span>
    <span className="gem-card-bottom"><span className="gem-progress-label">{progress.current} / {progress.total} {progress.total > 1 ? 'milestones' : 'milestone'}</span>
      <AchievementMeter current={progress.current} total={progress.total} label={`${gem.name} progress`} />
      <span className="gem-hint">{progress.record ? <EarnedDate value={progress.record.unlockedAt} /> : progress.hint}</span>
    </span>
  </button>;
}
