import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Card } from '../shared/Card';
import { AnnouncementCard } from './CommunityCards';

export function AnnouncementsPreview() {
  const {announcements,loading,error,retry}=useCommunity();
  return <Card className="p-6"><div className="community-section-heading"><h2><Bell size={18} />Recent Announcements</h2><Link to="/announcements" className="community-text-link">View all announcements</Link></div>
    {loading ? <p role="status">Loading announcements…</p> : error ? <div role="alert"><p>{error}</p><button onClick={retry} className="community-text-link">Retry</button></div> : announcements.length ? <div className="community-preview-grid">{announcements.slice(0,3).map(a=><AnnouncementCard key={a.id} announcement={a} compact />)}</div> : <div className="community-small-empty"><Bell size={28} /><h3>No published announcements yet</h3><p>Approved updates will appear here when available.</p></div>}
  </Card>;
}
