'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { StoryFormSchema, storyFormSchema } from '@/lib/validation';
import { SLIDE_LIMITS } from '@/lib/constants';
import { mockGenerateStory } from '@/lib/api';
import { GeneratedStory } from '@/lib/types';
import { Navigation } from '@/components/story-generator/navigation';
import { StoryConfiguration } from '@/components/story-generator/story-configuration';
import { ContentInput } from '@/components/story-generator/content-input';
import { BackgroundImages } from '@/components/story-generator/background-images';
import { Attachments } from '@/components/story-generator/attachments';
import { GenerationLoading } from '@/components/story-generator/generation-loading';
import { ResultPanel } from '@/components/story-generator/result-panel';
import { Button } from '@/components/ui/button';
import { Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [generationStep, setGenerationStep] = useState<'uploading' | 'generating' | 'finalizing'>('uploading');

  const form = useForm<StoryFormSchema>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      mode: 'news',
      template: 'news-standard',
      category: 'news-technology',
      slideCount: 8,
      voiceEngine: 'azure',
      inputMode: 'single',
      singleInput: '',
      specialNotes: '',
      slideInputs: [],
      backgroundSource: 'default',
      backgroundKeywords: '',
    },
  });

  const { mutate: generateStory, isPending, error } = useMutation({
    mutationFn: mockGenerateStory,
    onMutate: () => {
      setGenerationStep('uploading');
      setTimeout(() => setGenerationStep('generating'), 1000);
      setTimeout(() => setGenerationStep('finalizing'), 2000);
    },
    onSuccess: (data) => {
      setGeneratedStory(data);
      toast.success('Story generated successfully!');
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate story');
    },
  });

  const handleModeChange = (mode: 'news' | 'curious') => {
    const limits = SLIDE_LIMITS[mode];
    const currentSlideCount = form.getValues('slideCount');

    if (currentSlideCount < limits.min || currentSlideCount > limits.max) {
      form.setValue('slideCount', limits.default);
    }

    const currentTemplate = form.getValues('template');
    if (!currentTemplate.startsWith(mode)) {
      form.setValue('template', mode === 'news' ? 'news-standard' : 'curious-explainer');
    }

    const currentCategory = form.getValues('category');
    if (!currentCategory.startsWith(mode)) {
      form.setValue('category', mode === 'news' ? 'news-technology' : 'curious-science');
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedStory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (data: StoryFormSchema) => {
    generateStory(data as any);
  };

  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() || 'DEVELOPMENT';

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation environment={environment} />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">
            Create AI-Powered Stories
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Transform your content into engaging web stories with artificial intelligence
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <StoryConfiguration
            control={form.control}
            watch={form.watch}
            onModeChange={handleModeChange}
          />

          <ContentInput
            control={form.control}
            watch={form.watch}
            setValue={form.setValue}
          />

          <BackgroundImages control={form.control} />

          <Attachments />

          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || 'An error occurred while generating the story'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="w-full md:w-auto min-w-64 h-12 text-base font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/20"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </div>
        </form>

        {isPending && (
          <div className="mt-12">
            <GenerationLoading step={generationStep} />
          </div>
        )}

        {generatedStory && !isPending && (
          <div className="mt-12">
            <ResultPanel
              story={generatedStory}
              onGenerateAnother={handleGenerateAnother}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 mt-24 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-zinc-500">
          <p>© 2024 Story Generator. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
