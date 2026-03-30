'use client';

import { useState } from 'react';
import { Control, Controller, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { StoryFormSchema } from '@/lib/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProgressIndicator } from './progress-indicator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentInputProps {
  control: Control<StoryFormSchema>;
  watch: UseFormWatch<StoryFormSchema>;
  setValue: UseFormSetValue<StoryFormSchema>;
}

export function ContentInput({ control, watch, setValue }: ContentInputProps) {
  const mode = watch('mode');
  const slideCount = watch('slideCount');
  const inputMode = watch('inputMode');
  const slideInputs = watch('slideInputs') || [];

  const [currentSlide, setCurrentSlide] = useState(0);

  const placeholder =
    mode === 'news'
      ? 'Paste a news article URL, full text, or provide a summary prompt...'
      : 'Enter a topic, concept, or question to explore...';

  const handleSlideInput = (index: number, value: string) => {
    const updated = [...slideInputs];
    while (updated.length < slideCount) {
      updated.push('');
    }
    updated[index] = value;
    setValue('slideInputs', updated);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Content Input</h2>
        <p className="text-sm text-zinc-500">
          Provide the source material for your story
        </p>
      </div>

      <Controller
        name="inputMode"
        control={control}
        render={({ field }) => (
          <Tabs
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger
                value="single"
                className="data-[state=active]:bg-cyan-600"
              >
                Single Input
              </TabsTrigger>
              <TabsTrigger
                value="slideBySlide"
                className="data-[state=active]:bg-cyan-600"
              >
                Slide by Slide
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="singleInput" className="text-zinc-300 text-sm font-medium">
                  Story Content
                </Label>
                <Controller
                  name="singleInput"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        id="singleInput"
                        {...field}
                        placeholder={placeholder}
                        rows={8}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-400">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {mode === 'news' && (
                <div className="space-y-2">
                  <Label htmlFor="specialNotes" className="text-zinc-300 text-sm font-medium">
                    Special Notes
                    <span className="text-zinc-500 font-normal ml-2">
                      (Optional)
                    </span>
                  </Label>
                  <Controller
                    name="specialNotes"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="specialNotes"
                        {...field}
                        placeholder="Add any special instructions or context..."
                        rows={3}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                      />
                    )}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="slideBySlide" className="space-y-4 mt-4">
              <ProgressIndicator
                current={currentSlide + 1}
                total={slideCount}
              />

              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm font-medium">
                  Slide {currentSlide + 1} Content
                </Label>
                <Textarea
                  value={slideInputs[currentSlide] || ''}
                  onChange={(e) => handleSlideInput(currentSlide, e.target.value)}
                  placeholder={`Enter content for slide ${currentSlide + 1}...`}
                  rows={6}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Previous</span>
                </button>

                <div className="text-sm text-zinc-500">
                  {slideInputs.filter((s) => s.trim()).length} of {slideCount}{' '}
                  completed
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlide(Math.min(slideCount - 1, currentSlide + 1))
                  }
                  disabled={currentSlide === slideCount - 1}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                    'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500'
                  )}
                >
                  <span className="text-sm font-medium">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      />
    </div>
  );
}
