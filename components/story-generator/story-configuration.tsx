'use client';

import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { StoryFormSchema } from '@/lib/validation';
import { SegmentedControl } from './segmented-control';
import { TEMPLATES, CATEGORIES, SLIDE_LIMITS } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface StoryConfigurationProps {
  control: Control<StoryFormSchema>;
  watch: UseFormWatch<StoryFormSchema>;
  onModeChange: (mode: 'news' | 'curious') => void;
}

export function StoryConfiguration({
  control,
  watch,
  onModeChange,
}: StoryConfigurationProps) {
  const mode = watch('mode');
  const slideCount = watch('slideCount');
  const limits = SLIDE_LIMITS[mode];

  const filteredTemplates = TEMPLATES.filter((t) => t.mode === mode);
  const filteredCategories = CATEGORIES.filter((c) => c.mode === mode);
  const voiceEngine = watch('voiceEngine');

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1">
          Story Configuration
        </h2>
        <p className="text-sm text-zinc-500">
          Define the structure and settings for your story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm font-medium">
            Story Mode
          </Label>
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                options={[
                  { value: 'news' as const, label: 'News' },
                  { value: 'curious' as const, label: 'Curious (Coming soon)', disabled: true },
                ]}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  onModeChange(value);
                }}
                name="Story Mode"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300 text-sm font-medium">
            Voice Engine
          </Label>
          <Controller
            name="voiceEngine"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                options={[
                  { value: 'azure' as const, label: 'Azure' },
                  { value: 'elevenlabs' as const, label: 'ElevenLabs' },
                ]}
                value={field.value}
                onChange={field.onChange}
                name="Voice Engine"
              />
            )}
          />
        </div>

        {voiceEngine === 'elevenlabs' && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="voiceId" className="text-zinc-300 text-sm font-medium">
              ElevenLabs Voice ID
            </Label>
            <Controller
              name="voiceId"
              control={control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Input
                    id="voiceId"
                    {...field}
                    placeholder="Enter the ElevenLabs voice ID to use"
                    className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                  <p className="text-xs text-zinc-500">
                    This voice ID will override the default ElevenLabs voice for this request.
                  </p>
                  {fieldState.error ? (
                    <p className="text-sm text-red-400">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="template" className="text-zinc-300 text-sm font-medium">
            Template
          </Label>
          <Controller
            name="template"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="template"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                >
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-zinc-300 text-sm font-medium">
            Category
          </Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="category"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slideCount" className="text-zinc-300 text-sm font-medium">
            Slide Count
          </Label>
          <Controller
            name="slideCount"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    field.onChange(Math.max(limits.min, field.value - 1))
                  }
                  disabled={field.value <= limits.min}
                  className="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Decrease slide count"
                >
                  <Minus className="w-4 h-4 text-zinc-400" />
                </button>
                <Input
                  id="slideCount"
                  type="number"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || limits.default)
                  }
                  min={limits.min}
                  max={limits.max}
                  className="text-center bg-zinc-900 border-zinc-700 text-zinc-100 w-20"
                />
                <button
                  type="button"
                  onClick={() =>
                    field.onChange(Math.min(limits.max, field.value + 1))
                  }
                  disabled={field.value >= limits.max}
                  className="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="Increase slide count"
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                </button>
                <span className="text-sm text-zinc-500">
                  ({limits.min}-{limits.max})
                </span>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
