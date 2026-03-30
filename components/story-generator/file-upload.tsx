'use client';

import { useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILE_TYPE_LABELS } from '@/lib/constants';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  label?: string;
}

export function FileUpload({
  files,
  onFilesChange,
  accept,
  multiple = true,
  label = 'Drop files here or click to browse',
}: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (multiple) {
        onFilesChange([...files, ...droppedFiles]);
      } else {
        onFilesChange(droppedFiles.slice(0, 1));
      }
    },
    [files, onFilesChange, multiple]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (multiple) {
        onFilesChange([...files, ...selectedFiles]);
      } else {
        onFilesChange(selectedFiles.slice(0, 1));
      }
    },
    [files, onFilesChange, multiple]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'border-2 border-dashed border-zinc-700 rounded-lg p-8',
          'hover:border-cyan-500/50 hover:bg-zinc-800/30 transition-colors',
          'cursor-pointer group'
        )}
      >
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="w-10 h-10 text-zinc-600 group-hover:text-cyan-500 transition-colors mb-3" />
          <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors text-center">
            {label}
          </span>
          <input
            type="file"
            onChange={handleFileInput}
            accept={accept}
            multiple={multiple}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
