import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Gem, Lock } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { studentProgress } from '../../utils/studentControls';
import {
  CATEGORY_NAMES,
  achievementCategoryColumns,
  achievementProgress,
  type AchievementCategoryKey,
} from '../../utils/achievementRules';
import { GEMSTONE_ASSETS, type GemstoneAsset } from '../../assets/manifest';
import { ControlCard } from './ControlShared';
import { AchievementMeter, EarnedDate, GemstoneImage } from '../achievements/AchievementCard';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  SpecialAchievementBadge,
} from '../shared/PixelArt';

function CategoryBadge({ category, size = 28 }: { category: AchievementCategoryKey; size?: number }) {
  if (category === 'NT') return <NtTrackBadge size={size} className="shrink-0 rounded-lg" />;
  if (category === 'BA') return <BaTrackBadge size={size} className="shrink-0 rounded-lg" />;
  if (category === 'SM') return <SmTrackBadge size={size} className="shrink-0 rounded-lg" />;
  return <SpecialAchievementBadge size={size} className="shrink-0 rounded-lg" />;
}

const COLUMN_TONE_CLASS: Record<AchievementCategoryKey, string> = {
  NT: 'tone-nt',
  BA: 'tone-ba',
  SM: 'tone-sm',
  Special: 'tone-special',
};

export function AchievementCollectionBoard() {
  const { state } = useStudent();
  const columns = achievementCategoryColumns(state);

  return (
    <div
      className="collection-shelf-board"
      data-testid="achievement-collection-board"
      role="region"
      aria-label="Achievements organized by category"
    >
      {columns.map((col) => (
        <article
          key={col.category}
          data-testid={`collection-column-${col.category}`}
          className={`collection-shelf-col ${COLUMN_TONE_CLASS[col.category]}`}
        >
          <header className="collection-shelf-col-head">
            <div className="collection-shelf-col-title-row">
              <CategoryBadge category={col.category} />
              <h3>{col.name}</h3>
            </div>
            <div
              className="collection-shelf-score"
              aria-label={`${col.name}: ${col.unlockedCount} of ${col.totalCount} unlocked`}
            >
              <span>{col.unlockedCount}</span>
              <span className="collection-shelf-score-sep">/</span>
              <span>{col.totalCount}</span>
            </div>
          </header>

          <div className="collection-shelf-col-body">
            {col.unlockedGems.length > 0 ? (
              <div className="collection-shelf-gems">
                {col.unlockedGems.map(({ gem }) => (
                  <Link
                    key={gem.achievementId}
                    to="/achievements"
                    className="collection-shelf-gem"
                    aria-label={`${gem.name} (${gem.rarity}). View in Achievement Vault`}
                  >
                    <span className="collection-shelf-gem-art">
                      <GemstoneImage gem={gem} status="Unlocked" />
                    </span>
                    <span className="collection-shelf-gem-name">{gem.name}</span>
                    <span className="collection-shelf-gem-rarity">{gem.rarity}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="collection-shelf-empty">No gemstones unlocked yet</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function TrackCategoryBadge({ category, size = 16 }: { category: GemstoneAsset['category']; size?: number }) {
  if (category === 'NT') return <NtTrackBadge size={size} className="shrink-0" />;
  if (category === 'BA') return <BaTrackBadge size={size} className="shrink-0" />;
  if (category === 'SM') return <SmTrackBadge size={size} className="shrink-0" />;
  return <SpecialAchievementBadge size={size} className="shrink-0" />;
}

export function AchievementCollectionPanel() {
  const { state } = useStudent();
  const { collection } = studentProgress(state);
  const recentGems = collection.recent.slice(0, 4).map((entry) => entry.gem);
  const recentGemIds = new Set(recentGems.map((g) => g.achievementId));
  const starterFallbacks = [1, 6, 11, 16]
    .map((id) => GEMSTONE_ASSETS.find((g) => g.id === id)!)
    .filter((g) => g && !recentGemIds.has(g.achievementId));
  const displayedGems = [...recentGems, ...starterFallbacks].slice(0, 4);

  return (
    <ControlCard>
      <div className="collection-shelf-top">
        <div className="collection-shelf-title-wrap">
          <div className="control-profile-subhead-title">
            <span className="control-profile-subicon is-gem" aria-hidden="true">
              <Gem size={17} />
            </span>
            <h2 className="collection-shelf-heading">Recently Achieved Gemstones</h2>
          </div>
          <p className="collection-shelf-total" aria-label={`${collection.unlocked} of ${GEMSTONE_ASSETS.length} achievements unlocked`}>
            <strong>{collection.unlocked} / {GEMSTONE_ASSETS.length}</strong>
            <span>collected ({collection.percent}%)</span>
          </p>
        </div>
        <Link className="vault-primary-button collection-vault-cta" to="/achievements">
          <span>Open Achievement Vault</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="control-profile-gems-grid" data-testid="recent-achievements-grid">
        {displayedGems.map((gem) => {
          const progress = achievementProgress(gem, state);
          const StatusIcon =
            progress.status === 'Unlocked'
              ? CheckCircle2
              : progress.status === 'In Progress'
              ? Clock3
              : Lock;
          return (
            <Link
              key={gem.achievementId}
              to="/achievements"
              className={`gem-card gem-category-${gem.category} ${
                progress.record ? 'is-earned' : ''
              } control-profile-gem-card`}
              aria-label={`${gem.name}, ${progress.status}. Open Achievement Vault`}
            >
              <span className="gem-card-status">
                <StatusIcon size={13} aria-hidden="true" />
                <span>{progress.status}</span>
              </span>
              <span className="gem-art-stage">
                <GemstoneImage gem={gem} status={progress.status} />
              </span>
              <span className={`rarity-badge rarity-${gem.rarity.toLowerCase()}`}>
                {gem.rarity}
              </span>
              <span className="gem-card-title">{gem.name}</span>
              <span className="gem-category-label">
                <span aria-hidden="true" className="gem-category-logo">
                  <TrackCategoryBadge category={gem.category} size={16} />
                </span>
                <span>{CATEGORY_NAMES[gem.category]}</span>
              </span>
              <span className="gem-card-bottom">
                <AchievementMeter
                  current={progress.current}
                  total={progress.total}
                  label={`${gem.name} progress`}
                />
                <span className="gem-hint">
                  {progress.record ? (
                    <EarnedDate value={progress.record.unlockedAt} />
                  ) : (
                    progress.hint
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </ControlCard>
  );
}
