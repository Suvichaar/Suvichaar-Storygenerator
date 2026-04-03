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
  voiceId?: string;
  inputMode: InputMode;
  singleInput: string;
  slideStoryTitle?: string;
  slideAutoSplitInput?: string;
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
  backendBaseUrl: string;
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

export interface BackendSlide {
  placeholder_id: string;
  text?: string;
  image_url?: string;
  highlight_tags?: string[];
}

export interface BackendStoryResponse {
  id: string;
  mode: StoryMode;
  category: string;
  input_language?: string | null;
  slide_count: number;
  template_key: string;
  slide_deck: {
    template_key: string;
    language_code?: string | null;
    slides: BackendSlide[];
  };
  image_assets?: Array<{
    source: string;
  }>;
  canurl?: string | null;
  canurl1?: string | null;
  created_at: string;
}

export interface BackendLogEntry {
  timestamp: string;
  logger: string;
  level: string;
  message: string;
}

export interface BackendLogsResponse {
  count: number;
  total_buffered: number;
  logs: BackendLogEntry[];
}

export type PromptGroup = 'text_prompts' | 'image_prompts';

export interface PromptVersion {
  group: PromptGroup;
  key: string;
  version: string;
  file_name: string;
  description?: string | null;
  status?: string | null;
  allowed_categories: string[];
  required_placeholders: string[];
  system: string;
  user_template: string;
  is_active: boolean;
}

export interface PromptFamily {
  key: string;
  versions: PromptVersion[];
}

export interface PromptListing {
  text_prompts: PromptFamily[];
  image_prompts: PromptFamily[];
}

export interface PromptCreatePayload {
  group: PromptGroup;
  key: string;
  version: string;
  description?: string;
  status?: string;
  allowed_categories: string[];
  required_placeholders: string[];
  system: string;
  user_template: string;
  active: boolean;
}

export interface PromptUpdatePayload {
  description?: string;
  status?: string;
  allowed_categories: string[];
  required_placeholders: string[];
  system: string;
  user_template: string;
  active?: boolean;
}

export interface TemplateVersion {
  key: string;
  version: string;
  mode: StoryMode;
  file_name: string;
  file_path: string;
  slide_generator: string;
  description?: string | null;
  enabled: boolean;
  is_active: boolean;
  html_content: string;
}

export interface TemplateFamily {
  key: string;
  versions: TemplateVersion[];
}

export interface TemplateListing {
  templates: TemplateFamily[];
}

export interface TemplateCreatePayload {
  key: string;
  slide_generator: string;
  description?: string;
  enabled: boolean;
  active: boolean;
  html_content: string;
}

export interface TemplateUpdatePayload {
  slide_generator: string;
  description?: string;
  enabled: boolean;
  active?: boolean;
  html_content: string;
}
