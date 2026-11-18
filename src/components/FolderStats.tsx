import React from 'react';
import { Folder, FileText, HardDrive, Sparkles } from 'lucide-react';
import { DriveFile, FolderInfo } from '../types/drive';
import { formatBytes } from '../utils/driveUtils';

interface FolderStatsProps {
  folderInfo: FolderInfo | null;
  files: DriveFile[];
}

export const FolderStats: React.FC<FolderStatsProps> = ({ folderInfo, files }) => {
  const foldersCount = files.filter(
    (f) => f.mimeType === 'application/vnd.google-apps.folder'
  ).length;
  const filesCount = files.length - foldersCount;

  const totalBytes = files.reduce((acc, f) => {
    if (f.size) {
      const parsed = parseInt(f.size, 10);
      return isNaN(parsed) ? acc : acc + parsed;
    }
    return acc;
  }, 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
      <div className="flex items-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {folderInfo?.name || 'Google Drive Folder'}
        </h1>
        {folderInfo?.description && (
          <span className="text-xs text-slate-500 italic max-w-sm truncate hidden md:inline">
            — {folderInfo.description}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80">
          <Folder className="w-3.5 h-3.5 text-amber-500" />
          <span>{foldersCount} {foldersCount === 1 ? 'folder' : 'folders'}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80">
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          <span>{filesCount} {filesCount === 1 ? 'file' : 'files'}</span>
        </span>

        {totalBytes > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>{formatBytes(totalBytes)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
