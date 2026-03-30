'use client';

import { Control, Controller } from 'react-hook-form';
import { StoryFormSchema } from '@/lib/validation';
import { CollapsibleSection } from './collapsible-section';
import { FileUpload } from './file-upload';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BackgroundImagesProps {
  control: Control<StoryFormSchema>;
}

export function BackgroundImages({ control }: BackgroundImagesProps) {
  const [customBackgrounds, setCustomBackgrounds] = useState<File[]>([]);

  return (
    <CollapsibleSection
      title="Slide Background Images"
      subtitle="Optional - Customize slide backgrounds"
    >
      <Controller
        name="backgroundSource"
        control={control}
        render={({ field }) => (
          <div className="space-y-6">
            <div>
              <Label className="text-zinc-300 text-sm font-medium mb-3 block">
                Background Source
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'default', label: 'Default' },
                  { value: 'ai', label: 'AI Generated' },
                  { value: 'pexels', label: 'Pexels' },
                  { value: 'custom', label: 'Custom Upload' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                      'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950',
                      field.value === option.value
                        ? 'bg-cyan-600 text-white border-cyan-600'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {(field.value === 'ai' || field.value === 'pexels') && (
              <div className="space-y-2">
                <Label htmlFor="backgroundKeywords" className="text-zinc-300 text-sm font-medium">
                  Keywords / Tags
                </Label>
                <Controller
                  name="backgroundKeywords"
                  control={control}
                  render={({ field: keywordField }) => (
                    <Input
                      id="backgroundKeywords"
                      {...keywordField}
                      placeholder="Enter keywords separated by commas..."
                      className="bg-zinc-900 border-zinc-700 text-zinc-100"
                    />
                  )}
                />
                <p className="text-xs text-zinc-500">
                  Example: technology, innovation, modern, abstract
                </p>
              </div>
            )}

            {field.value === 'custom' && (
              <div>
                <Label className="text-zinc-300 text-sm font-medium mb-3 block">
                  Upload Images
                </Label>
                <FileUpload
                  files={customBackgrounds}
                  onFilesChange={setCustomBackgrounds}
                  accept={SUPPORTED_FILE_TYPES.images.join(',')}
                  label="Drop images here or click to browse"
                />
              </div>
            )}
          </div>
        )}
      />
    </CollapsibleSection>
  );
}
