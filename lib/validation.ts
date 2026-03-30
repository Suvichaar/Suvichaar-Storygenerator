import { z } from 'zod';
import { SLIDE_LIMITS } from './constants';

export const storyFormSchema = z.object({
  mode: z.enum(['news', 'curious']),
  template: z.string().min(1, 'Template is required'),
  category: z.string().min(1, 'Category is required'),
  slideCount: z.number().int().min(5).max(15),
  voiceEngine: z.enum(['azure', 'elevenlabs']),
  inputMode: z.enum(['single', 'slideBySlide']),
  singleInput: z.string().optional(),
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
  if (data.inputMode === 'single') {
    return data.singleInput && data.singleInput.trim().length > 0;
  }
  return true;
}, {
  message: 'Content is required',
  path: ['singleInput'],
}).refine((data) => {
  if (data.inputMode === 'slideBySlide') {
    return data.slideInputs && data.slideInputs.length === data.slideCount;
  }
  return true;
}, {
  message: 'All slides must have content',
  path: ['slideInputs'],
});

export type StoryFormSchema = z.infer<typeof storyFormSchema>;
