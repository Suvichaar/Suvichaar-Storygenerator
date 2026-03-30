import { StoryMode, Template, Category, SlideLimits } from './types';

export const TEMPLATES: Template[] = [
  { id: 'news-standard', name: 'Standard News', mode: 'news' },
  { id: 'news-breaking', name: 'Breaking News', mode: 'news' },
  { id: 'news-feature', name: 'Feature Story', mode: 'news' },
  { id: 'curious-explainer', name: 'Explainer', mode: 'curious' },
  { id: 'curious-deep-dive', name: 'Deep Dive', mode: 'curious' },
  { id: 'curious-quick-facts', name: 'Quick Facts', mode: 'curious' },
];

export const CATEGORIES: Category[] = [
  { id: 'news-politics', name: 'Politics', mode: 'news' },
  { id: 'news-technology', name: 'Technology', mode: 'news' },
  { id: 'news-business', name: 'Business', mode: 'news' },
  { id: 'news-sports', name: 'Sports', mode: 'news' },
  { id: 'curious-science', name: 'Science', mode: 'curious' },
  { id: 'curious-history', name: 'History', mode: 'curious' },
  { id: 'curious-nature', name: 'Nature', mode: 'curious' },
  { id: 'curious-culture', name: 'Culture', mode: 'curious' },
];

export const SLIDE_LIMITS: Record<StoryMode, SlideLimits> = {
  news: { min: 5, max: 12, default: 8 },
  curious: { min: 6, max: 15, default: 10 },
};

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
