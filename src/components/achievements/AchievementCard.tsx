import { useState } from 'react';
import { CheckCircle2, Lock, Clock3 } from 'lucide-react';
import type { GemstoneAsset } from '../../assets/manifest';
import type { StudentState } from '../../types';
import { achievementProgress, CATEGORY_NAMES } from '../../utils/achievementRules';

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
  return <button type="button" className={`gem-card gem-category-${gem.category} ${progress.record ? 'is-earned' : ''}`} onClick={onSelect} aria-label={`${gem.name}, ${progress.status}. View details`}>
    <span className="gem-card-status"><Icon size={14} />{progress.record && !progress.record.celebrationAcknowledged ? 'Newly Unlocked' : progress.status}</span>
    <span className="gem-art-stage"><GemstoneImage gem={gem} status={progress.status} /></span>
    <span className={`rarity-badge rarity-${gem.rarity.toLowerCase()}`}>{gem.rarity}</span>
    <span className="gem-card-title">{gem.name}</span><span className="gem-category-label">{CATEGORY_NAMES[gem.category]}</span>
    <span className="gem-description">{gem.description}</span>
    <span className="gem-requirement"><strong>To unlock</strong>{gem.requirement}</span>
    <span className="gem-card-bottom"><span className="gem-progress-label">{progress.current} / {progress.total} {progress.total > 1 ? 'milestones' : 'milestone'}</span>
      <AchievementMeter current={progress.current} total={progress.total} label={`${gem.name} progress`} />
      <span className="gem-hint">{progress.record ? <EarnedDate value={progress.record.unlockedAt} /> : progress.hint}</span>
    </span>
  </button>;
}
