'use client';

import { useState } from 'react';
import { CollapsibleSection } from './collapsible-section';
import { FileUpload } from './file-upload';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';

export function Attachments() {
  const [attachments, setAttachments] = useState<File[]>([]);

  return (
    <CollapsibleSection
      title="Content Attachments"
      subtitle="Optional - Upload supporting documents or media"
    >
      <div className="space-y-3">
        <FileUpload
          files={attachments}
          onFilesChange={setAttachments}
          accept={SUPPORTED_FILE_TYPES.attachments.join(',')}
          label="Drop files here or click to browse"
        />
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>Supported formats:</span>
          <span className="text-zinc-400">PDF</span>
          <span>•</span>
          <span className="text-zinc-400">DOCX</span>
          <span>•</span>
          <span className="text-zinc-400">JPG</span>
          <span>•</span>
          <span className="text-zinc-400">PNG</span>
          <span>•</span>
          <span className="text-zinc-400">WEBP</span>
        </div>
      </div>
    </CollapsibleSection>
  );
}
