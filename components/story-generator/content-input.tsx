'use client';

import { useEffect, useState } from 'react';
import { Control, Controller, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { StoryFormSchema } from '@/lib/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProgressIndicator } from './progress-indicator';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  SINGLE_INPUT_CHARACTER_LIMIT,
  SLIDE_INPUT_CHARACTER_LIMIT,
} from '@/lib/constants';

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
  const slideStoryTitle = watch('slideStoryTitle') || '';
  const slideAutoSplitInput = watch('slideAutoSplitInput') || '';
  const editableSlideCount = mode === 'news' ? Math.max(slideCount - 2, 1) : slideCount;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showStructuredImport, setShowStructuredImport] = useState(false);

  const placeholder =
    mode === 'news'
      ? 'Paste a news article URL, full text, or provide a summary prompt...'
      : 'Enter a topic, concept, or question to explore...';

  const handleSlideInput = (index: number, value: string) => {
    const updated = [...slideInputs];
    while (updated.length < editableSlideCount) {
      updated.push('');
    }
    updated[index] = value.slice(0, SLIDE_INPUT_CHARACTER_LIMIT);
    setValue('slideInputs', updated);
  };

  useEffect(() => {
    setCurrentSlide((previous) => Math.min(previous, editableSlideCount - 1));
  }, [editableSlideCount]);

  const parseStructuredSlides = (value: string) => {
    const normalized = value.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return { title: '', slides: [] as string[] };
    }

    const titleMatch = normalized.match(/^title\s*:\s*(.+)$/im);
    const slideMatches = Array.from(
      normalized.matchAll(/slide\s*\d+\s*:\s*([\s\S]*?)(?=\nslide\s*\d+\s*:|$)/gi)
    );

    if (slideMatches.length > 0) {
      return {
        title: titleMatch?.[1]?.trim() || '',
        slides: slideMatches.map((match) => match[1].trim()).filter(Boolean),
      };
    }

    const blocks = normalized
      .split(/\n\s*---+\s*\n|\n\s*\n+/)
      .map((block) => block.trim())
      .filter(Boolean);

    if (blocks.length === 0) {
      return { title: '', slides: [] as string[] };
    }

    return {
      title: blocks[0],
      slides: blocks.slice(1),
    };
  };

  const applyAutoSplit = () => {
    const parsed = parseStructuredSlides(slideAutoSplitInput);
    if (parsed.title) {
      setValue('slideStoryTitle', parsed.title.slice(0, 120), { shouldValidate: true });
    }

    const nextSlides = Array.from({ length: editableSlideCount }, (_, index) =>
      (parsed.slides[index] || '').slice(0, SLIDE_INPUT_CHARACTER_LIMIT)
    );

    setValue('slideInputs', nextSlides, { shouldValidate: true });
    setCurrentSlide(0);
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
            onValueChange={(value) => {
              field.onChange(value);

              if (value === 'slideBySlide') {
                setValue('singleInput', '');
              }

              if (value === 'single') {
                setValue('slideStoryTitle', '');
                setValue('slideAutoSplitInput', '');
                setValue('slideInputs', []);
              }
            }}
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
                        maxLength={SINGLE_INPUT_CHARACTER_LIMIT}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                      />
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Paste article text, source URL, or a structured story brief.</span>
                        <span>
                          {(field.value || '').length}/{SINGLE_INPUT_CHARACTER_LIMIT}
                        </span>
                      </div>
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
                total={editableSlideCount}
              />

              <div className="rounded-lg border border-cyan-900/40 bg-cyan-950/30 p-3 text-sm text-cyan-200">
                Add your story title first. Then fill the story slides. The last slide is reserved for CTA and will be generated automatically.
              </div>

              <Collapsible
                open={showStructuredImport}
                onOpenChange={setShowStructuredImport}
                className="rounded-lg border border-zinc-800 bg-zinc-950/60"
              >
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Import Structured Content</p>
                      <p className="text-xs text-zinc-500">
                        Paste a predefined title-and-slides format and auto-fill the fields below.
                      </p>
                    </div>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="mt-0.5 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="Show structured content format help"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="max-w-sm whitespace-pre-line border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-200"
                        >
                          {'Accepted formats:\n\n1. Title + Slide labels\nTitle: Your headline\nSlide 1: First slide content\nSlide 2: Second slide content\n\n2. Block format\nYour headline\n---\nFirst slide content\n---\nSecond slide content\n\nThe first part becomes the cover title. The remaining parts fill the editable slides.'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CollapsibleTrigger
                    className={cn(
                      'rounded-lg border border-cyan-700 bg-cyan-600/15 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors',
                      'hover:bg-cyan-600/25 focus:outline-none focus:ring-2 focus:ring-cyan-500'
                    )}
                  >
                    {showStructuredImport ? 'Hide Import Helper' : 'Import Structured Content'}
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="border-t border-zinc-800 px-4 py-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="slideAutoSplitInput" className="text-zinc-300 text-sm font-medium">
                        Paste structured story content
                      </Label>
                      <p className="text-xs text-zinc-500">
                        Use <code className="text-zinc-300">Title:</code> and <code className="text-zinc-300">Slide 1:</code> format, or separate blocks with <code className="text-zinc-300">---</code>.
                      </p>
                    </div>
                    <Controller
                      name="slideAutoSplitInput"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="slideAutoSplitInput"
                          {...field}
                          placeholder={'Title: Your story title\n\nSlide 1: First slide content\n\nSlide 2: Second slide content'}
                          rows={6}
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                        />
                      )}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        Extra slides beyond the current editable count are ignored.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          applyAutoSplit();
                          setShowStructuredImport(false);
                        }}
                        disabled={!slideAutoSplitInput.trim()}
                        className={cn(
                          'rounded-lg border border-cyan-700 bg-cyan-600/15 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors',
                          'hover:bg-cyan-600/25 disabled:cursor-not-allowed disabled:opacity-50',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500'
                        )}
                      >
                        Auto Fill Slides
                      </button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="space-y-2">
                <Label htmlFor="slideStoryTitle" className="text-zinc-300 text-sm font-medium">
                  Enter your story title
                </Label>
                <Controller
                  name="slideStoryTitle"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Textarea
                        id="slideStoryTitle"
                        {...field}
                        placeholder="Enter your story title..."
                        rows={2}
                        maxLength={120}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                      />
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>This title will be used as the cover slide.</span>
                        <span>{slideStoryTitle.length}/120</span>
                      </div>
                      {fieldState.error && (
                        <p className="text-sm text-red-400">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm font-medium">
                  Slide {currentSlide + 1} Content
                </Label>
                <Textarea
                  value={slideInputs[currentSlide] || ''}
                  onChange={(e) => handleSlideInput(currentSlide, e.target.value)}
                  placeholder={`Enter content for slide ${currentSlide + 1}...`}
                  rows={6}
                  maxLength={SLIDE_INPUT_CHARACTER_LIMIT}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 resize-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Keep each slide concise. This text will be sent to the backend in slide order.</span>
                  <span>
                    {(slideInputs[currentSlide] || '').length}/{SLIDE_INPUT_CHARACTER_LIMIT}
                  </span>
                </div>
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
                  {slideInputs.slice(0, editableSlideCount).filter((s) => s.trim()).length} of {editableSlideCount}{' '}
                  completed
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlide(Math.min(editableSlideCount - 1, currentSlide + 1))
                  }
                  disabled={currentSlide === editableSlideCount - 1}
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

              <Controller
                name="slideInputs"
                control={control}
                render={({ fieldState }) => (
                  <>
                    {fieldState.error ? (
                      <p className="text-sm text-red-400">{fieldState.error.message}</p>
                    ) : null}
                  </>
                )}
              />
            </TabsContent>
          </Tabs>
        )}
      />
    </div>
  );
}
