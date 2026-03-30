import { z } from 'zod';
import { SLIDE_LIMITS } from './constants';

function getEditableSlideCount(mode: 'news' | 'curious', slideCount: number) {
  if (mode === 'news') {
    return Math.max(slideCount - 2, 1);
  }

  return slideCount;
}

export const storyFormSchema = z.object({
  mode: z.enum(['news', 'curious']),
  template: z.string().min(1, 'Template is required'),
  category: z.string().min(1, 'Category is required'),
  slideCount: z.number().int().min(5).max(15),
  voiceEngine: z.enum(['azure', 'elevenlabs']),
  voiceId: z.string().optional(),
  inputMode: z.enum(['single', 'slideBySlide']),
  singleInput: z.string().optional(),
  slideStoryTitle: z.string().optional(),
  slideAutoSplitInput: z.string().optional(),
  specialNotes: z.string().optional(),
  slideInputs: z.array(z.string()).optional(),
  backgroundSource: z.enum(['default', 'ai', 'pexels', 'custom']),
  backgroundKeywords: z.string().optional(),
}).refine((data) => {
  const limits = SLIDE_LIMITS[data.mode];
  return data.slideCount >= limits.min && data.slideCount <= limits.max;
}, {
  message: 'Slide count must be within the valid range for the selected mode',
  path: ['slideCount'],
}).refine((data) => {
  if (data.voiceEngine === 'elevenlabs') {
    return Boolean(data.voiceId && data.voiceId.trim().length > 0);
  }
  return true;
}, {
  message: 'Voice ID is required for ElevenLabs',
  path: ['voiceId'],
}).refine((data) => {
  if (data.inputMode === 'single') {
    return data.singleInput && data.singleInput.trim().length > 0;
  }
  return true;
}, {
  message: 'Content is required',
  path: ['singleInput'],
}).refine((data) => {
  if (data.inputMode === 'slideBySlide') {
    return data.slideStoryTitle && data.slideStoryTitle.trim().length > 0;
  }
  return true;
}, {
  message: 'Story title is required for slide-by-slide mode',
  path: ['slideStoryTitle'],
}).refine((data) => {
  if (data.inputMode === 'slideBySlide') {
    const editableSlideCount = getEditableSlideCount(data.mode, data.slideCount);
    const filledSlides = (data.slideInputs || []).slice(0, editableSlideCount);
    return (
      filledSlides.length === editableSlideCount &&
      filledSlides.every((slide) => slide.trim().length > 0)
    );
  }
  return true;
}, {
  message: 'All editable story slides must have content. Cover title and CTA are handled separately.',
  path: ['slideInputs'],
});

export type StoryFormSchema = z.infer<typeof storyFormSchema>;
