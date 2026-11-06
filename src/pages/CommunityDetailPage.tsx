import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { AlumniIdentity, AlumniStoryCard, SourceLink } from '../components/community/CommunityCards';
import { CATEGORY_NAMES } from '../utils/achievementRules';
import { displayDate } from '../utils/communitySelectors';

export function CommunityDetailPage({kind}:{kind:'alumni'|'announcements'}) {
  const {id}=useParams(); const {stories,announcements,loading,error,retry}=useCommunity();
  const story=kind==='alumni'?stories.find(s=>s.id===id):undefined;
  const announcement=kind==='announcements'?announcements.find(a=>a.id===id):undefined;
  const record=story||announcement;
  const back=<Link to={`/${kind}`} className="community-text-link"><ArrowLeft size={16}/>Back to {kind==='alumni'?'Alumni Stories':'Announcements'}</Link>;
  if(loading) return <div className="community-empty" role="status">Loading published content…</div>;
  if(error) return <div className="community-empty" role="alert">{back}<p>{error}</p><button onClick={retry} className="vault-primary-button">Try again</button></div>;
  if(!record) return <div className="community-empty">{back}<h1>{kind==='alumni'?'Story':'Announcement'} unavailable</h1><p>This link may be incorrect, or the content is no longer published.</p></div>;
  const related=story?stories.filter(s=>s.id!==story.id&&s.track===story.track).slice(0,3):[];
  return <div className="community-page">{back}<article className="community-detail">
    <span className="community-tag">{story?CATEGORY_NAMES[story.track]:announcement!.category}</span><h1>{record.title}</h1>
    {record.publishedAt&&<p className="community-date">Published {displayDate(record.publishedAt)}</p>}
    {story?<><AlumniIdentity story={story}/>{[['Journey overview',story.experience],['Challenges experienced',story.challenges],['Skills developed',story.skills],['Career experience',story.careerExperience],['Lessons learned',story.lessons],['Advice to incoming students',story.advice]].map(([title,text])=>text?<section key={title}><h2>{title}</h2><p className="community-prose">{text}</p></section>:null)}{story.editorialSummary&&<aside className="community-editorial"><h2>Editorial summary</h2><p>{story.editorialSummary}</p></aside>}</>:<><p>{announcement!.description}</p><div className="community-prose">{announcement!.content}</div>{announcement!.expiresAt&&<p>Available until {displayDate(announcement!.expiresAt)}</p>}<SourceLink url={announcement!.externalLink}/></>}
    <footer>Source: {record.source} · Verified for publication</footer>
  </article>{related.length>0&&<section><h2 className="community-subheading">More journeys from this track</h2><div className="community-grid">{related.map(s=><AlumniStoryCard key={s.id} story={s}/>)}</div></section>}{back}</div>;
}
