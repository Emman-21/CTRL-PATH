import React from 'react';
import {
  ExternalLink,
  Eye,
  FolderOpen,
  Folder,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import { DriveFile, ViewMode } from '../types/drive';
import { formatBytes, formatDate } from '../utils/driveUtils';
import { FileIcon } from './FileIcon';

interface FileListProps {
  files: DriveFile[];
  viewMode: ViewMode;
  onOpenFolder: (folder: DriveFile) => void;
  onOpenFile: (file: DriveFile) => void;
  isLoading: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  viewMode,
  onOpenFolder,
  onOpenFile,
  isLoading,
}) => {
  if (files.length === 0 && !isLoading) {
    return (
      <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Folder className="w-6 h-6 fill-amber-500/20" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No items found</h3>
        <p className="text-xs text-slate-500">
          This folder is either empty, or no items match your current filter query.
        </p>
      </div>
    );
  }

  const isFolder = (file: DriveFile) =>
    file.mimeType === 'application/vnd.google-apps.folder';

  if (viewMode === 'table') {
    return (
      <div className="bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-medium text-xs">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 hidden md:table-cell">Type</th>
                <th className="py-3 px-4 hidden sm:table-cell">Size</th>
                <th className="py-3 px-4 hidden lg:table-cell">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file) => {
                const folder = isFolder(file);
                return (
                  <tr
                    key={file.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => (folder ? onOpenFolder(file) : onOpenFile(file))}
                          className="min-h-11 md:min-h-0 flex items-center gap-3 text-left group-hover:text-blue-600 cursor-pointer min-w-0"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 group-hover:border-blue-200 flex-shrink-0">
                            <FileIcon
                              mimeType={file.mimeType}
                              fileName={file.name}
                              className="w-4 h-4"
                            />
                          </div>
                          <span className="font-medium text-slate-900 group-hover:text-blue-600 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {file.name}
                          </span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell truncate max-w-[140px]">
                      {folder
                        ? 'Folder'
                        : file.mimeType.replace('application/vnd.google-apps.', '')}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 hidden sm:table-cell whitespace-nowrap">
                      {folder ? '—' : formatBytes(file.size)}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(file.modifiedTime)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 md:gap-1.5">
                        {folder ? (
                          <button
                            type="button"
                            onClick={() => onOpenFolder(file)}
                            className="inline-flex items-center gap-1 min-h-11 md:min-h-0 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenFile(file)}
                            className="inline-flex items-center gap-1 min-h-11 md:min-h-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                            title="Read or preview file content"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </button>
                        )}

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const folder = isFolder(file);
        return (
          <div
            key={file.id}
            className="group relative bg-[var(--surface)] dark:bg-[#0f172a] rounded-2xl border border-[var(--border)] dark:border-slate-800 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between overflow-hidden"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div
                onClick={() => (folder ? onOpenFolder(file) : onOpenFile(file))}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50/80 border border-slate-200/60 group-hover:border-blue-200 transition-colors flex-shrink-0"
              >
                <FileIcon
                  mimeType={file.mimeType}
                  fileName={file.name}
                  className="w-6 h-6"
                />
              </div>

              <div className="flex items-center gap-1">
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Title & metadata */}
            <div
              onClick={() => (folder ? onOpenFolder(file) : onOpenFile(file))}
              className="cursor-pointer mb-3"
            >
              <h4
                className="font-medium text-slate-900 group-hover:text-blue-600 text-sm line-clamp-2 leading-snug break-words"
                title={file.name}
              >
                {file.name}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span>{folder ? 'Folder' : formatBytes(file.size)}</span>
                <span>•</span>
                <span className="truncate">{formatDate(file.modifiedTime)}</span>
              </div>
            </div>

            {/* Bottom action button */}
            <div className="pt-2 border-t border-slate-100 mt-auto flex items-center justify-between">
              {folder ? (
                <button
                  type="button"
                  onClick={() => onOpenFolder(file)}
                  className="w-full min-h-11 md:min-h-0 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open Folder</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenFile(file)}
                  className="w-full min-h-11 md:min-h-0 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Content</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
