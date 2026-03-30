export type StoryMode = 'news' | 'curious';
export type VoiceEngine = 'azure' | 'elevenlabs';
export type BackgroundSource = 'default' | 'ai' | 'pexels' | 'custom';
export type InputMode = 'single' | 'slideBySlide';

export interface Template {
  id: string;
  name: string;
  mode: StoryMode;
}

export interface Category {
  id: string;
  name: string;
  mode: StoryMode;
}

export interface SlideLimits {
  min: number;
  max: number;
  default: number;
}

export interface StoryFormData {
  mode: StoryMode;
  template: string;
  category: string;
  slideCount: number;
  voiceEngine: VoiceEngine;
  inputMode: InputMode;
  singleInput: string;
  specialNotes?: string;
  slideInputs: string[];
  backgroundSource: BackgroundSource;
  backgroundKeywords?: string;
  customBackgrounds?: File[];
  attachments?: File[];
}

export interface GeneratedStory {
  id: string;
  mode: StoryMode;
  template: string;
  category: string;
  slideCount: number;
  language: string;
  voiceEngine: VoiceEngine;
  backgroundSource: BackgroundSource;
  primaryUrl: string;
  htmlUrl: string;
  createdAt: string;
  slides: GeneratedSlide[];
}

export interface GeneratedSlide {
  number: number;
  text: string;
  imageUrl?: string;
}

export interface GenerationProgress {
  step: 'uploading' | 'generating' | 'finalizing';
  message: string;
}
