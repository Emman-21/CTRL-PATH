import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import type { AlumniStory, Announcement } from '../types/community';
import { communityRepository } from '../data/communityData';
import { publishedAnnouncements, publishedStories } from '../utils/communitySelectors';

const CommunityContext = createContext<{
  stories: AlumniStory[]; announcements: Announcement[]; loading: boolean; error: string; retry: () => void;
} | null>(null);
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [rawStories, setStories] = useState<readonly AlumniStory[]>([]);
  const [rawAnnouncements, setAnnouncements] = useState<readonly Announcement[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [revision,setRevision] = useState(0);
  const [now,setNow] = useState(Date.now);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    Promise.all([communityRepository.stories(),communityRepository.announcements()]).then(([stories,announcements]) => {
      if (active) { setStories(stories); setAnnouncements(announcements); setLoading(false); }
    }).catch(() => { if (active) { setError('Published content could not be loaded. Please try again.'); setLoading(false); } });
    return () => { active=false; };
  },[revision]);
  useEffect(() => { const timer=setInterval(()=>setNow(Date.now()),60000); return ()=>clearInterval(timer); },[]);
  const stories=useMemo(()=>publishedStories(rawStories,now),[rawStories,now]);
  const announcements=useMemo(()=>publishedAnnouncements(rawAnnouncements,now),[rawAnnouncements,now]);
  return <CommunityContext.Provider value={{stories,announcements,loading,error,retry:()=>setRevision(n=>n+1)}}>{children}</CommunityContext.Provider>;
}
export function useCommunity() { const value=useContext(CommunityContext); if(!value) throw new Error('CommunityProvider is required'); return value; }
