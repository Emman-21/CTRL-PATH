import { FileCategory } from '../types/drive';

/**
 * Extracts a Google Drive folder or file ID from various URL formats or raw ID string.
 */
export function extractFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Already a raw ID (typically 25-50 alphanumeric characters with - or _)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches /folders/<id>
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Matches /file/d/<id> or /d/<id>
  const fileMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  // Matches id parameter in query string e.g. ?id=<id>
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  return trimmed;
}

/**
 * Formats byte size into human readable string.
 */
export function formatBytes(bytes?: string | number): string {
  if (bytes === undefined || bytes === null || bytes === '') return '—';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num < 0) return '—';
  if (num === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  const clampedIndex = Math.min(i, units.length - 1);
  const formattedVal = (num / Math.pow(1024, clampedIndex)).toFixed(clampedIndex === 0 ? 0 : 1);
  return `${formattedVal} ${units[clampedIndex]}`;
}

/**
 * Categorizes a file based on MIME type.
 */
export function getFileCategory(mimeType: string, fileName = ''): FileCategory {
  if (!mimeType) return 'other';
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (mimeType === 'application/vnd.google-apps.document' || mimeType.includes('word') || mimeType.includes('document')) {
    return 'document';
  }
  if (mimeType === 'application/vnd.google-apps.spreadsheet' || mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return 'spreadsheet';
  }
  if (mimeType === 'application/vnd.google-apps.presentation' || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return 'presentation';
  }
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return 'pdf';
  }
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (
    mimeType.includes('json') ||
    mimeType.includes('javascript') ||
    mimeType.includes('typescript') ||
    mimeType.includes('html') ||
    mimeType.includes('xml') ||
    mimeType.includes('css') ||
    mimeType.includes('x-python') ||
    fileName.match(/\.(ts|tsx|js|jsx|json|py|java|c|cpp|cs|go|rs|sql|sh|yaml|yml|md)$/i)
  ) {
    return 'code';
  }
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gzip') || mimeType.includes('compressed')) {
    return 'archive';
  }
  return 'other';
}

/**
 * Formats date into readable string.
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
