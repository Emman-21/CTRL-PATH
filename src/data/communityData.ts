import type { AlumniStory, Announcement } from '../types/community';

// No authentic, consented alumni records or approved notices were supplied.
// Publishing workflow: collect consent -> verify content/optional fields -> approve
// publication -> set published. Future writes must use authenticated server roles.
// Reference screenshot identities and quotes are not publication-ready records.
export const ALUMNI_STORIES: readonly AlumniStory[] = [];
export const ANNOUNCEMENTS: readonly Announcement[] = [];

// Read-only asynchronous boundary for a future approved publishing service.
export const communityRepository = {
  stories: async (): Promise<readonly AlumniStory[]> => ALUMNI_STORIES,
  announcements: async (): Promise<readonly Announcement[]> => ANNOUNCEMENTS,
};
