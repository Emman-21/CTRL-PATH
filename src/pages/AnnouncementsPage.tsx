import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { BACKGROUNDS } from '../assets/manifest';
import { useCommunity } from '../context/CommunityContext';
import { ANNOUNCEMENT_CATEGORIES } from '../types/community';
import { filterAnnouncements } from '../utils/communitySelectors';
import { AnnouncementCard } from '../components/community/CommunityCards';

export function AnnouncementsPage() {
  const {announcements,loading,error,retry}=useCommunity();
  const [query,setQuery]=useState(''); const [category,setCategory]=useState('All');
  const filtered=filterAnnouncements(announcements,category,query);
  const clear=()=>{setQuery('');setCategory('All');};
  return <div className="community-page">
    <PageHeader title="The Luminary Bulletin" subtitle="Stay informed about important updates and activities on your CTRL+PATH journey." backgroundImage={BACKGROUNDS.dashboardSkyKingdom} luniPose="point" luniTitle="A little clarity for your journey" luniQuote="Published updates will appear here when available. You can check each announcement's source and date."/>
    <section className="community-toolbar" aria-label="Find announcements">
      <label>Category<select aria-label="Announcement category" value={category} onChange={e=>setCategory(e.target.value)}><option value="All">All categories ({announcements.length})</option>{ANNOUNCEMENT_CATEGORIES.map(c=><option key={c} value={c}>{c} ({announcements.filter(a=>a.category===c).length})</option>)}</select></label>
      <label className="community-search">Search bulletin<span><Search size={17}/><input aria-label="Search announcements" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search published updates" /></span></label>
      <button className="community-secondary-button" disabled={!query&&category==='All'} onClick={clear}>Clear filters</button>
    </section>
    <div className="community-section-heading"><h2><Bell size={20}/>Published announcements</h2><span role="status">{filtered.length} available · Pinned first, then newest</span></div>
    {loading ? <div className="community-empty" role="status">Loading announcements…</div> : error ? <div className="community-empty" role="alert"><p>{error}</p><button className="vault-primary-button" onClick={retry}>Try again</button></div> : filtered.length ? <div className="community-grid">{filtered.map(a=><AnnouncementCard key={a.id} announcement={a}/>)}</div> : <section className="community-empty"><div className="community-empty-icon"><Bell size={34}/></div><span className="vault-eyebrow">Your noticeboard, ready for updates</span><h2>{announcements.length?'No matching announcements':'No published announcements yet'}</h2><p>{announcements.length?'Try another category or search term.':'Approved updates will appear here when available. There are no announcements to display right now.'}</p>{(query||category!=='All')&&<button className="vault-primary-button" onClick={clear}>Clear search and filters</button>}</section>}
  </div>;
}
