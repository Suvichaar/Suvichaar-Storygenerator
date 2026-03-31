'use client';

import { Control, Controller } from 'react-hook-form';
import { CollapsibleSection } from './collapsible-section';
import { FileUpload } from './file-upload';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { StoryFormSchema } from '@/lib/validation';

interface AttachmentsProps {
  control: Control<StoryFormSchema>;
}

export function Attachments({ control }: AttachmentsProps) {

  return (
    <CollapsibleSection
      title="Content Attachments"
      subtitle="Optional - Upload supporting documents or media"
    >
      <Controller
        name="attachments"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            <FileUpload
              files={field.value || []}
              onFilesChange={field.onChange}
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
        )}
      />
    </CollapsibleSection>
  );
}
