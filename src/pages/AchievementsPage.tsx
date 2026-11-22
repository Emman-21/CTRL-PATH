import { useState } from 'react';
import { Sparkles, ArrowDown, Gem, CheckCircle2, Clock3, Lock } from 'lucide-react';
import { BACKGROUNDS, GEMSTONE_ASSETS, type GemstoneAsset } from '../assets/manifest';
import { useStudent } from '../context/StudentContext';
import { achievementStats, CATEGORY_NAMES, filterAchievements, RARITIES } from '../utils/achievementRules';
import { AchievementCard, AchievementMeter } from '../components/achievements/AchievementCard';
import { AchievementDetailModal } from '../components/achievements/AchievementDetailModal';
import { LuniSprite } from '../components/luni/LuniSprite';
import {
  NtTrackBadge,
  BaTrackBadge,
  SmTrackBadge,
  SpecialAchievementBadge,
} from '../components/shared/PixelArt';

export function AchievementsPage() {
  const { state } = useStudent();
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [rarity, setRarity] = useState('All');
  const [sort, setSort] = useState('Collection order');
  const [selected, setSelected] = useState<GemstoneAsset | null>(null);
  const stats = achievementStats(state);
  const gems = filterAchievements(state, category, status, sort, rarity);
  return <div className="achievement-vault" data-reduced-motion={state.preferences.reducedMotion}>
    <section className="vault-hero">
      <img className="vault-garden" src={BACKGROUNDS.achievementsCrystalGarden} alt="" /><div className="vault-hero-shade" />
      <div className="vault-hero-copy">
        <span className="vault-eyebrow"><Sparkles size={14} /> A collection of discoveries</span>
        <h1>The Achievement <span>Vault</span></h1>
        <p>Every gemstone tells a story of your journey. Collect, explore, and celebrate the discoveries you've made!</p>
        <a href="#gem-collection" className="vault-primary-button">View collection <ArrowDown size={16} /></a>
      </div>
      <div className="vault-hero-guide">
        <img className="vault-floating-gem gem-one" src={GEMSTONE_ASSETS[0].url} alt="" />
        <img className="vault-floating-gem gem-two" src={GEMSTONE_ASSETS[9].url} alt="" />
        <LuniSprite pose="celebrate" size={150} animate={false} />
        <p>Welcome to your Achievement Vault, Luminary! Every gemstone represents a step forward in your journey!</p>
      </div>
    </section>
    <section className="vault-overview" aria-label="Collection progress">
      <div className="vault-total"><span className="vault-eyebrow"><Gem size={16} /> Your gemstone collection</span>
        <div><strong>{stats.unlocked}<small> / 20</small></strong><b>{stats.percent}%</b></div>
        <AchievementMeter current={stats.unlocked} total={20} label="Overall gemstone collection" />
        <p className="vault-total-breakdown">
          <span className="vault-stat-chip is-unlocked"><CheckCircle2 size={13} aria-hidden="true" /><strong>{stats.unlocked}</strong> unlocked</span>
          <span className="vault-stat-chip is-progress"><Clock3 size={13} aria-hidden="true" /><strong>{stats.inProgress}</strong> in progress</span>
          <span className="vault-stat-chip is-locked"><Lock size={13} aria-hidden="true" /><strong>{stats.locked}</strong> locked</span>
        </p>
      </div>
      <div className="vault-category-counts">{Object.entries(CATEGORY_NAMES).map(([key, name]) => {
        const badge =
          key === 'NT' ? (
            <NtTrackBadge size={36} className="shrink-0" />
          ) : key === 'BA' ? (
            <BaTrackBadge size={36} className="shrink-0" />
          ) : key === 'SM' ? (
            <SmTrackBadge size={36} className="shrink-0" />
          ) : (
            <SpecialAchievementBadge size={36} className="shrink-0" />
          );
        return (
          <button key={key} className={`gem-category-${key}`} aria-pressed={category === key} onClick={() => setCategory(prev => (prev === key ? 'All' : key))} aria-label={`Filter ${name}, ${stats.categories[key]} of 5 unlocked`}>
            {badge}
            <strong>{stats.categories[key]} <small>/ 5</small></strong>
            <span>{key === 'Special' ? 'Special' : key}</span>
          </button>
        );
      })}</div>
    </section>
    <section id="gem-collection" className="vault-collection" aria-labelledby="collection-title">
      <div className="vault-collection-heading"><div><span className="vault-eyebrow">Twenty gems. Your own pace.</span><h2 id="collection-title">Discover your collection</h2></div><span role="status" aria-live="polite">Showing {gems.length} of 20</span></div>
      <div className="vault-filters">
        <div className="vault-category-filters" role="group" aria-label="Achievement category">
          {[['All', 'All Achievements'], ...Object.entries(CATEGORY_NAMES)].map(([key, name]) => {
            const logo =
              key === 'NT' ? (
                <NtTrackBadge size={20} className="shrink-0" />
              ) : key === 'BA' ? (
                <BaTrackBadge size={20} className="shrink-0" />
              ) : key === 'SM' ? (
                <SmTrackBadge size={20} className="shrink-0" />
              ) : key === 'Special' ? (
                <SpecialAchievementBadge size={20} className="shrink-0" />
              ) : (
                <Gem size={17} className="shrink-0" aria-hidden="true" />
              );
            return (
              <button key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>
                <span className="vault-filter-logo" aria-hidden="true">{logo}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
        <div className="vault-select-filters">
          <label>Status<select aria-label="Status" value={status} onChange={e => setStatus(e.target.value)}>{['All', 'Locked', 'In Progress', 'Unlocked'].map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Rarity<select aria-label="Rarity" value={rarity} onChange={e => setRarity(e.target.value)}>{['All', ...RARITIES].map(r => <option key={r}>{r}</option>)}</select></label>
          <label>Sort by<select aria-label="Sort by" value={sort} onChange={e => setSort(e.target.value)}>{['Collection order', 'Name', 'Rarity', 'Recently Unlocked'].map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
      </div>
      <div className="vault-gem-grid">{gems.map(gem => <AchievementCard key={gem.achievementId} gem={gem} state={state} onSelect={() => setSelected(gem)} />)}</div>
      {!gems.length && <div className="vault-empty"><Gem size={36} /><h3>No gemstones match these filters yet.</h3><p>Your collection grows with meaningful discoveries. There is no rush.</p><button className="vault-primary-button" onClick={() => { setCategory('All'); setStatus('All'); setRarity('All'); }}>View all achievements</button></div>}
    </section>
    <aside className="vault-footer"><div className="vault-luni-note"><LuniSprite pose="love" size={80} animate={false} /><div><h3>Progress, never pressure.</h3><p>Look at how far you've come! Every small achievement matters!</p><p>Gemstones celebrate your learning. Your academic pathway is always your choice.</p></div></div><div className="vault-rarity-guide"><strong>Rarity guide</strong><div>{RARITIES.map(r => <span key={r} className={`rarity-badge rarity-${r.toLowerCase()}`}>{r}</span>)}</div></div></aside>
    {selected && <AchievementDetailModal gem={selected} onClose={() => setSelected(null)} />}
  </div>;
}
