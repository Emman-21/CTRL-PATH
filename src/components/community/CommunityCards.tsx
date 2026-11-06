import { Link } from 'react-router-dom';
import { UserRound, Pin, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { AlumniStory, Announcement } from '../../types/community';
import { CATEGORY_NAMES } from '../../utils/achievementRules';
import { displayDate, safeExternalLink } from '../../utils/communitySelectors';

export function AlumniIdentity({ story }: { story: AlumniStory }) {
  const [failed,setFailed]=useState(false);
  return <div className="community-identity">
    {story.profileImage && !failed ? <img src={story.profileImage} alt={`${story.displayName || 'Alumni contributor'} portrait`} onError={()=>setFailed(true)} loading="lazy" /> : <span className="neutral-avatar"><UserRound aria-hidden="true" /></span>}
    <div><strong>{story.displayName || 'Alumni contributor'}</strong>{story.currentRole && <p>{story.currentRole}</p>}{story.organization && <p>{story.organization}</p>}{story.graduationYear && <p>Class of {story.graduationYear}</p>}</div>
  </div>;
}
export function AlumniStoryCard({ story }: { story: AlumniStory }) {
  return <article className={`community-card gem-category-${story.track}`}>
    <span className="community-tag">{CATEGORY_NAMES[story.track]}</span>
    <h3><Link to={`/alumni/${encodeURIComponent(story.id)}`}>{story.title}</Link></h3>
    <p>{story.excerpt}</p><AlumniIdentity story={story} />
    <Link className="community-text-link" to={`/alumni/${encodeURIComponent(story.id)}`}>Read story <span className="sr-only">{story.title}</span><ArrowUpRight size={15} /></Link>
  </article>;
}
export function AnnouncementCard({ announcement:a, compact=false }: { announcement:Announcement; compact?:boolean }) {
  return <article className={`community-card ${compact ? 'community-card-compact' : ''}`}>
    <div className="community-card-meta"><span className="community-tag">{a.category}</span>{a.pinned && <span><Pin size={13} />Pinned</span>}<span>{displayDate(a.publishedAt)}</span></div>
    <h3><Link to={`/announcements/${encodeURIComponent(a.id)}`}>{a.title}</Link></h3><p>{a.description}</p>
    <Link className="community-text-link" to={`/announcements/${encodeURIComponent(a.id)}`}>Read announcement <span className="sr-only">{a.title}</span><ArrowUpRight size={15} /></Link>
  </article>;
}
export function SourceLink({ url }: { url?:string }) {
  const safe=safeExternalLink(url);
  return safe ? <a href={safe} target="_blank" rel="noopener noreferrer" className="community-text-link">Visit source <ArrowUpRight size={15} /><span className="sr-only">Opens in a new tab</span></a> : null;
}
