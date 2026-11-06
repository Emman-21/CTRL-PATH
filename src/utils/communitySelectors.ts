import type { AlumniStory, Announcement } from '../types/community';
const timestamp = (value?: string) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
export function displayDate(value?: string) {
  const parsed = timestamp(value);
  return parsed === null ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed);
}
export function safeExternalLink(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
export function publishedStories(records: readonly AlumniStory[], now = Date.now()): AlumniStory[] {
  return records.filter(r => r.publicationStatus === 'published' && r.verificationStatus === 'verified' && r.publicationConsent &&
    !!r.id && !!r.title && !!r.experience && !!r.source && ['NT','BA','SM'].includes(r.track) &&
    (!timestamp(r.publishedAt) || timestamp(r.publishedAt)! <= now)).map(r => {
    const publicRecord = { ...r };
    for (const field of ['displayName','graduationYear','currentRole','organization','profileImage'] as const) {
      if (!r.approvedFields.includes(field)) delete publicRecord[field];
    }
    if (publicRecord.profileImage && !publicRecord.profileImage.startsWith('/assets/') && !safeExternalLink(publicRecord.profileImage)) delete publicRecord.profileImage;
    return publicRecord;
  });
}
export function filterStories(records: readonly AlumniStory[], track: string, query: string) {
  const term = query.trim().toLocaleLowerCase();
  return records.filter(r => (track === 'All' || r.track === track) && [r.title, r.displayName, ...(r.keywords || [])].some(v => v?.toLocaleLowerCase().includes(term)))
    .sort((a,b) => Number(!!b.featured)-Number(!!a.featured) || (timestamp(b.publishedAt) || 0)-(timestamp(a.publishedAt) || 0) || a.id.localeCompare(b.id));
}
export function publishedAnnouncements(records: readonly Announcement[], now = Date.now()) {
  return records.filter(r => r.publicationStatus === 'published' && r.verificationStatus === 'verified' && !!r.id && !!r.title && !!r.content && !!r.source &&
    (!timestamp(r.publishedAt) || timestamp(r.publishedAt)! <= now) &&
    (!r.expiresAt || (timestamp(r.expiresAt) !== null && timestamp(r.expiresAt)! > now)))
    .sort((a,b) => Number(b.pinned)-Number(a.pinned) || (timestamp(b.publishedAt) || 0)-(timestamp(a.publishedAt) || 0) || a.id.localeCompare(b.id));
}
export function filterAnnouncements(records: readonly Announcement[], category: string, query: string) {
  const term = query.trim().toLocaleLowerCase();
  return records.filter(r => (category === 'All' || r.category === category) && [r.title,r.description,r.content].some(v => v.toLocaleLowerCase().includes(term)));
}
