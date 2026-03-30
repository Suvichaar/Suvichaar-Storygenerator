import { StoryMode, Template, Category, SlideLimits } from './types';

export const TEMPLATES: Template[] = [
  { id: 'test-news-1', name: 'Standard Template', mode: 'news' },
  { id: 'test-news-2', name: 'Feature News', mode: 'news' },
  { id: 'test-news-3', name: 'Breaking News', mode: 'news' },
  { id: 'curious-explainer', name: 'Explainer', mode: 'curious' },
  { id: 'curious-deep-dive', name: 'Deep Dive', mode: 'curious' },
  { id: 'curious-quick-facts', name: 'Quick Facts', mode: 'curious' },
];

export const CATEGORIES: Category[] = [
  { id: 'News', name: 'News', mode: 'news' },
  { id: 'curious-science', name: 'Science', mode: 'curious' },
  { id: 'curious-history', name: 'History', mode: 'curious' },
  { id: 'curious-nature', name: 'Nature', mode: 'curious' },
  { id: 'curious-culture', name: 'Culture', mode: 'curious' },
];

export const SLIDE_LIMITS: Record<StoryMode, SlideLimits> = {
  news: { min: 5, max: 12, default: 8 },
  curious: { min: 6, max: 15, default: 10 },
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
