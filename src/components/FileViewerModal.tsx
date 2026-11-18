import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Loader2,
  Table as TableIcon,
  Code,
  Calendar,
  User as UserIcon,
  HardDrive,
} from 'lucide-react';
import { DriveFile } from '../types/drive';
import { readFileContent, FileContentResult } from '../services/drive';
import { formatBytes, formatDate } from '../utils/driveUtils';
import { FileIcon } from './FileIcon';

interface FileViewerModalProps {
  file: DriveFile | null;
  accessToken: string;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  accessToken,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<FileContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file || !accessToken) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setContent(null);

    readFileContent(file, accessToken)
      .then((res) => {
        if (isMounted) {
          setContent(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to read file content.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      // Clean up blob URL if created
      if (content?.type === 'blob') {
        URL.revokeObjectURL(content.blobUrl);
      }
    };
  }, [file?.id, accessToken]);

  if (!file) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse simple CSV
  const parseCsv = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows = lines.slice(0, 100).map((line) => {
      // Basic CSV splitter (handles basic quotes)
      const values: string[] = [];
      let inQuotes = false;
      let token = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(token.trim());
          token = '';
        } else {
          token += char;
        }
      }
      values.push(token.trim());
      return values;
    });
    return {
      header: rows[0] || [],
      rows: rows.slice(1),
      totalRows: lines.length,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-xs flex-shrink-0">
              <FileIcon mimeType={file.mimeType} fileName={file.name} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">
                {file.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>Modified {formatDate(file.modifiedTime)}</span>
                {file.owners && file.owners[0] && (
                  <>
                    <span>•</span>
                    <span className="truncate">Owner: {file.owners[0].displayName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Drive</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          {loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Reading file content from Google Drive...</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-xl bg-red-50 border border-red-200 max-w-xl mx-auto my-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-sm font-semibold text-red-900">Unable to preview file content</h3>
              <p className="text-xs text-red-700">{error}</p>
              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open directly in Google Drive</span>
                </a>
              )}
            </div>
          )}

          {!loading && !error && content && (
            <>
              {/* Plain text / Code / Exported Google Doc */}
              {content.type === 'text' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-500" />
                      <span>{content.text.split('\n').length} lines • {content.text.length.toLocaleString()} characters</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(content.text)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy content</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[60vh]">
                    {content.text || '(File is empty)'}
                  </pre>
                </div>
              )}

              {/* Spreadsheet CSV table */}
              {content.type === 'csv' && (() => {
                const parsed = parseCsv(content.text);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs">
                      <span className="font-medium text-slate-600 flex items-center gap-1.5">
                        <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Showing {parsed.rows.length + 1} of {parsed.totalRows} rows</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(content.text)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied CSV!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy raw CSV</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs max-h-[60vh]">
                      <table className="w-full text-left text-xs border-collapse">
                        {parsed.header.length > 0 && (
                          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3 w-10 text-slate-400 font-mono text-[10px]">#</th>
                              {parsed.header.map((col, idx) => (
                                <th key={idx} className="py-2.5 px-3 font-semibold border-r border-slate-200 last:border-r-0 truncate max-w-[200px]">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {parsed.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 text-slate-400 text-[10px] bg-slate-50/50">{rIdx + 2}</td>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-2 px-3 text-slate-700 border-r border-slate-100 last:border-r-0 truncate max-w-[220px]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* Images / PDF Blobs */}
              {content.type === 'blob' && (
                <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-slate-200 min-h-[400px]">
                  {content.mimeType.startsWith('image/') ? (
                    <img
                      src={content.blobUrl}
                      alt={file.name}
                      className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-xs"
                    />
                  ) : content.mimeType === 'application/pdf' ? (
                    <iframe
                      src={content.blobUrl}
                      title={file.name}
                      className="w-full h-[65vh] rounded-lg border-0"
                    />
                  ) : null}
                </div>
              )}

              {/* Unsupported / Native format banner */}
              {content.type === 'unsupported' && (
                <div className="p-8 rounded-xl bg-white border border-slate-200 max-w-lg mx-auto my-12 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <FileIcon mimeType={file.mimeType} fileName={file.name} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{file.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{content.reason}</p>
                  </div>
                  {content.webViewLink && (
                    <a
                      href={content.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Open in Google Drive</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400">ID: {file.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
