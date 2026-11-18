export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  shared?: boolean;
  owners?: Array<{
    displayName: string;
    emailAddress?: string;
    photoLink?: string;
  }>;
  description?: string;
}

export interface FolderInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  description?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export type ViewMode = 'grid' | 'table';

export type FileCategory =
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'archive'
  | 'other';
