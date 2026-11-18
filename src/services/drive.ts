import { DriveFile, FolderInfo } from '../types/drive';

export class DriveApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'DriveApiError';
    this.status = status;
  }
}

/**
 * Fetch folder metadata.
 */
export async function getFolderDetails(
  folderId: string,
  accessToken: string
): Promise<FolderInfo> {
  const fields = 'id,name,mimeType,description,modifiedTime,webViewLink';
  const url = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=${fields}&supportsAllDrives=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      (response.status === 404
        ? 'Folder not found. Please check the folder link or ID.'
        : response.status === 403
        ? 'Access denied. Make sure your signed-in Google account has permission to view this folder.'
        : `Drive API error (${response.status})`);
    throw new DriveApiError(message, response.status);
  }

  return response.json();
}

/**
 * List files and subfolders inside a specific folder.
 */
export async function listFolderContents(
  folderId: string,
  accessToken: string,
  searchQuery = '',
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  let query = `'${folderId}' in parents and trashed = false`;
  if (searchQuery.trim()) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    query += ` and name contains '${escaped}'`;
  }

  const fields =
    'nextPageToken,files(id,name,mimeType,size,modifiedTime,createdTime,iconLink,thumbnailLink,webViewLink,webContentLink,shared,owners,description)';
  const params = new URLSearchParams({
    q: query,
    fields,
    orderBy: 'folder,name',
    pageSize: '100',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      (response.status === 404
        ? 'Folder not found or no access.'
        : response.status === 403
        ? 'Access denied. You may need permission from the owner or link-sharing enabled.'
        : `Failed to load files (${response.status})`);
    throw new DriveApiError(message, response.status);
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

export type FileContentResult =
  | { type: 'text'; text: string; format?: string }
  | { type: 'csv'; text: string }
  | { type: 'blob'; blobUrl: string; mimeType: string }
  | { type: 'unsupported'; webViewLink?: string; reason: string };

/**
 * Reads or exports the content of a file in Google Drive.
 */
export async function readFileContent(
  file: DriveFile,
  accessToken: string
): Promise<FileContentResult> {
  const mime = file.mimeType;

  try {
    // 1. Google Docs -> Export as plain text or html
    if (mime === 'application/vnd.google-apps.document') {
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
      const res = await fetch(exportUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const text = await res.text();
      return { type: 'text', text, format: 'plain' };
    }

    // 2. Google Sheets -> Export as CSV
    if (mime === 'application/vnd.google-apps.spreadsheet') {
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`;
      const res = await fetch(exportUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const text = await res.text();
      return { type: 'csv', text };
    }

    // 3. Google Presentations or other native formats that can be viewed externally
    if (mime === 'application/vnd.google-apps.presentation' || mime.startsWith('application/vnd.google-apps.')) {
      return {
        type: 'unsupported',
        webViewLink: file.webViewLink,
        reason: 'Google Slides and Workspace native files are best viewed in Google Drive directly.',
      };
    }

    // 4. PDF or Images -> Fetch as Blob for embedded preview
    if (mime === 'application/pdf' || mime.startsWith('image/')) {
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`;
      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return { type: 'blob', blobUrl, mimeType: mime };
    }

    // 5. Text files, markdown, code, json, csv
    const isTextLike =
      mime.startsWith('text/') ||
      mime.includes('json') ||
      mime.includes('javascript') ||
      mime.includes('xml') ||
      mime.includes('csv') ||
      file.name.match(/\.(txt|md|json|js|ts|tsx|jsx|html|css|py|csv|yml|yaml|xml|sql|env)$/i);

    if (isTextLike) {
      const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`;
      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const text = await res.text();
      return { type: 'text', text };
    }

    // Default for generic binary files
    return {
      type: 'unsupported',
      webViewLink: file.webViewLink,
      reason: 'This file format is binary or large. You can open or download it directly.',
    };
  } catch (err: any) {
    throw new Error(err.message || 'Failed to read file content.');
  }
}
