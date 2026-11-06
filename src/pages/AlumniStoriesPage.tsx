import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Compass } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { BACKGROUNDS } from '../assets/manifest';
import { useCommunity } from '../context/CommunityContext';
import { filterStories } from '../utils/communitySelectors';
import { CATEGORY_NAMES } from '../utils/achievementRules';
import { AlumniStoryCard } from '../components/community/CommunityCards';

export function AlumniStoriesPage() {
  const {stories,loading,error,retry}=useCommunity();
  const [query,setQuery]=useState('');
  const [track,setTrack]=useState('All');
  const filtered=filterStories(stories,track,query);
  const featured=filtered.filter(s=>s.featured);
  const regular=filtered.filter(s=>!s.featured);
  const clear=()=>{setQuery('');setTrack('All');};
  return <div className="community-page">
    <PageHeader title="Stories Beyond the Path" subtitle="Discover real experiences, lessons, and journeys from alumni who once stood where you are today." backgroundImage={BACKGROUNDS.trackExplorerAcademy} luniPose="sit" luniTitle="Every journey is different" luniQuote={stories.length ? "Everyone's journey is different, Luminary! Let's learn from the experiences of those who came before us." : "Real alumni stories will appear here once they're available. You can keep exploring the three tracks in the meantime!"} />
    <section className="community-toolbar" aria-label="Find alumni stories">
      <label>Academic track<select aria-label="Alumni track" value={track} onChange={e=>setTrack(e.target.value)}><option value="All">All Tracks ({stories.length})</option>{(['NT','BA','SM'] as const).map(t=><option key={t} value={t}>{CATEGORY_NAMES[t]} ({stories.filter(s=>s.track===t).length})</option>)}</select></label>
      <label className="community-search">Search stories<span><Search size={17} aria-hidden="true"/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Story title, name, or approved keywords" aria-label="Search alumni stories" /></span></label>
      <button className="community-secondary-button" onClick={clear} disabled={!query && track==='All'}>Clear filters</button>
    </section>
    {loading ? <div className="community-empty" role="status">Loading alumni stories…</div> : error ? <div className="community-empty" role="alert"><h2>Stories are temporarily unavailable</h2><p>{error}</p><button className="vault-primary-button" onClick={retry}>Try again</button></div> : <>
      <div className="community-section-heading"><h2><BookOpen size={20}/>Alumni journeys</h2><span role="status">{filtered.length} {filtered.length===1?'story':'stories'} available</span></div>
      {filtered.length ? <>{featured.length>0 && <section aria-label="Featured alumni stories"><h2 className="community-subheading">Featured stories</h2><div className="community-grid">{featured.map(s=><AlumniStoryCard key={s.id} story={s}/>)}</div></section>}{regular.length>0 && <div className="community-grid">{regular.map(s=><AlumniStoryCard key={s.id} story={s}/>)}</div>}</> : <section className="community-empty"><div className="community-empty-icon"><BookOpen size={34}/></div><span className="vault-eyebrow">A library of real experiences</span><h2>{stories.length ? 'No stories match your search' : 'Alumni stories are coming soon'}</h2><p>{stories.length ? 'Try another track or clear your search to see available stories.' : "We're preparing a space for real experiences to help guide your journey. No alumni stories have been approved for publication here yet."}</p>{stories.length ? <button onClick={clear} className="vault-primary-button">Show all stories</button> : <Link className="vault-primary-button" to="/tracks"><Compass size={16}/>Explore the three pathways</Link>}</section>}
      <aside className="community-editorial"><h2>Make room for your own story</h2><p>As you explore, note what interests you, what feels challenging, and what you want to ask. An alumni story can offer perspective; your academic decision remains your own.</p><span>CTRL+PATH editorial guidance · Not an alumni testimonial</span><Link to="/control-center?section=reflections" className="community-text-link">Open your private reflections</Link></aside>
    </>}
  </div>;
}
