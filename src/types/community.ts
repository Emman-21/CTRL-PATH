import type { TrackCode } from './index';
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type VerificationStatus = 'unverified' | 'verified';
export type AlumniPublicField = 'displayName' | 'graduationYear' | 'currentRole' | 'organization' | 'profileImage';
export interface AlumniStory {
  id: string;
  track: TrackCode;
  title: string;
  excerpt: string;
  experience: string;
  challenges?: string;
  lessons?: string;
  skills?: string;
  careerExperience?: string;
  advice?: string;
  editorialSummary?: string;
  displayName?: string;
  graduationYear?: number;
  currentRole?: string;
  organization?: string;
  profileImage?: string;
  approvedFields: AlumniPublicField[];
  publicationConsent: boolean;
  publicationStatus: PublicationStatus;
  verificationStatus: VerificationStatus;
  source: string;
  keywords?: string[];
  publishedAt?: string;
  featured?: boolean;
}
export const ANNOUNCEMENT_CATEGORIES = ['General', 'Academic', 'Events', 'System Updates', 'Opportunities'] as const;
export type AnnouncementCategory = typeof ANNOUNCEMENT_CATEGORIES[number];
export interface Announcement {
  id: string;
  title: string;
  description: string;
  content: string;
  category: AnnouncementCategory;
  publishedAt: string;
  expiresAt?: string;
  source: string;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  externalLink?: string;
  pinned: boolean;
}
