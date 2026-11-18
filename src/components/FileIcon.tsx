import React from 'react';
import {
  Folder,
  FileText,
  Table,
  Presentation,
  FileCheck,
  Image,
  Video,
  Music,
  Code2,
  Archive,
  File,
} from 'lucide-react';
import { getFileCategory } from '../utils/driveUtils';

interface FileIconProps {
  mimeType: string;
  fileName?: string;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  mimeType,
  fileName = '',
  className = 'w-5 h-5',
}) => {
  const category = getFileCategory(mimeType, fileName);

  switch (category) {
    case 'folder':
      return <Folder className={`${className} text-amber-500 fill-amber-500/20`} />;
    case 'document':
      return <FileText className={`${className} text-blue-600`} />;
    case 'spreadsheet':
      return <Table className={`${className} text-emerald-600`} />;
    case 'presentation':
      return <Presentation className={`${className} text-amber-600`} />;
    case 'pdf':
      return <FileCheck className={`${className} text-red-600`} />;
    case 'image':
      return <Image className={`${className} text-indigo-600`} />;
    case 'video':
      return <Video className={`${className} text-purple-600`} />;
    case 'audio':
      return <Music className={`${className} text-rose-600`} />;
    case 'code':
      return <Code2 className={`${className} text-cyan-600`} />;
    case 'archive':
      return <Archive className={`${className} text-amber-700`} />;
    default:
      return <File className={`${className} text-slate-500`} />;
  }
};
