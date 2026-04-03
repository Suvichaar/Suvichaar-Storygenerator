import { StoryMode, Template, Category, SlideLimits } from './types';

export const TEMPLATES: Template[] = [
  { id: 'test-news-1', name: 'Standard Template', mode: 'news' },
  { id: 'test-news-2', name: 'Feature News', mode: 'news' },
  { id: 'test-news-3', name: 'Breaking News', mode: 'news' },
  { id: 'curious-template-1', name: 'Template-1 (curious-template-1)', mode: 'curious' },
  { id: 'curious-template-2', name: 'Template-2 (curious-template-2)', mode: 'curious' },
  { id: 'template-v19', name: 'Template-3 (template-v19)', mode: 'curious' },
];

export const CATEGORIES: Category[] = [
  { id: 'News', name: 'News', mode: 'news' },
  { id: 'Education', name: 'Education', mode: 'curious' },
  { id: 'History', name: 'History', mode: 'curious' },
  { id: 'Culture', name: 'Culture', mode: 'curious' },
  { id: 'Wildlife', name: 'Wildlife', mode: 'curious' },
];

export const SLIDE_LIMITS: Record<StoryMode, SlideLimits> = {
  news: { min: 4, max: 10, default: 8 },
  curious: { min: 4, max: 10, default: 8 },
};

export const SINGLE_INPUT_CHARACTER_LIMIT = 5000;
export const SLIDE_INPUT_CHARACTER_LIMIT = 280;

export const SUPPORTED_FILE_TYPES = {
  attachments: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'],
  images: ['image/jpeg', 'image/png', 'image/webp'],
};

export const FILE_TYPE_LABELS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
};
