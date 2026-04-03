'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { StoryFormSchema, storyFormSchema } from '@/lib/validation';
import { CATEGORIES, SLIDE_LIMITS, TEMPLATES } from '@/lib/constants';
import { generateStory } from '@/lib/api';
import { GeneratedStory } from '@/lib/types';
import { Navigation } from '@/components/story-generator/navigation';
import { StoryConfiguration } from '@/components/story-generator/story-configuration';
import { ContentInput } from '@/components/story-generator/content-input';
import { BackgroundImages } from '@/components/story-generator/background-images';
import { Attachments } from '@/components/story-generator/attachments';
import { GenerationLoading } from '@/components/story-generator/generation-loading';
import { ResultPanel } from '@/components/story-generator/result-panel';
import { PromptManagement } from '@/components/story-generator/prompt-management';
import { TemplateManagement } from '@/components/story-generator/template-management';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home() {
  const [activeSection, setActiveSection] = useState<'story' | 'prompts' | 'templates'>('story');
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [generationStep, setGenerationStep] = useState<'uploading' | 'generating' | 'finalizing'>('uploading');

  const form = useForm<StoryFormSchema>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      mode: 'news',
      template: 'test-news-1',
      category: 'News',
      slideCount: 8,
      voiceEngine: 'azure',
      voiceId: '',
      inputMode: 'single',
      singleInput: '',
      slideStoryTitle: '',
      slideAutoSplitInput: '',
      specialNotes: '',
      slideInputs: [],
      backgroundSource: 'default',
      backgroundKeywords: '',
      customBackgrounds: [],
      attachments: [],
    },
  });

  const { mutate: submitStory, isPending, error } = useMutation({
    mutationFn: generateStory,
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
    const validTemplateIds = TEMPLATES.filter((template) => template.mode === mode).map((template) => template.id);
    if (!validTemplateIds.includes(currentTemplate)) {
      form.setValue('template', mode === 'news' ? 'test-news-1' : 'curious-template-1');
    }

    const currentCategory = form.getValues('category');
    const validCategoryIds = CATEGORIES.filter((category) => category.mode === mode).map((category) => category.id);
    if (!validCategoryIds.includes(currentCategory)) {
      form.setValue('category', mode === 'news' ? 'News' : 'Education');
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedStory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (data: StoryFormSchema) => {
    submitStory(data as any);
  };

  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() || 'DEVELOPMENT';
  const activeMode = form.watch('mode');

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation environment={environment} mode={activeMode} />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">
            Create AI-Powered Stories
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Transform your content into engaging web stories with artificial intelligence
          </p>
        </div>

        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'story' | 'prompts' | 'templates')}>
          <TabsList className="mb-8 grid w-full grid-cols-3 bg-zinc-800">
            <TabsTrigger value="story" className="data-[state=active]:bg-cyan-600">
              Story Generator
            </TabsTrigger>
            <TabsTrigger value="prompts" className="data-[state=active]:bg-cyan-600">
              Prompt Management
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-cyan-600">
              Template Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="story" className="space-y-8">
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

              <Attachments control={form.control} />

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
          </TabsContent>

          <TabsContent value="prompts">
            <PromptManagement mode={activeMode} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManagement mode={activeMode} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-zinc-800 mt-24 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-zinc-500">
          <p>© 2026 Suvichaar. Powered by Suvichaar.</p>
        </div>
      </footer>
    </div>
  );
}
