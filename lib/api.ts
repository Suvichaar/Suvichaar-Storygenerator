import {
  BackendLogsResponse,
  BackendStoryResponse,
  GeneratedStory,
  PromptCreatePayload,
  PromptGroup,
  PromptListing,
  PromptUpdatePayload,
  PromptVersion,
  StoryFormData,
  StoryMode,
  TemplateCreatePayload,
  TemplateListing,
  TemplateUpdatePayload,
  TemplateVersion,
} from './types';

const FALLBACK_NEWS_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://engine-service.azurewebsites.net';

const FALLBACK_CURIOUS_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8001'
    : 'https://curious-engine-service.azurewebsites.net';

function getApiBaseUrl(mode: StoryMode): string {
  if (mode === 'curious') {
    return (
      process.env.NEXT_PUBLIC_CURIOUS_API_BASE_URL ||
      FALLBACK_CURIOUS_API_BASE_URL
    );
  }

  return (
    process.env.NEXT_PUBLIC_NEWS_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    FALLBACK_NEWS_API_BASE_URL
  );
}

function mapVoiceEngineToBackend(voiceEngine: StoryFormData['voiceEngine']): string {
  return voiceEngine === 'azure' ? 'azure_basic' : 'elevenlabs_pro';
}

function mapBackgroundSourceToBackend(backgroundSource: StoryFormData['backgroundSource']): string | null {
  if (backgroundSource === 'default') {
    return null;
  }

  return backgroundSource;
}

function buildUserInput(data: StoryFormData): string {
  if (data.inputMode === 'slideBySlide') {
    const editableSlideCount = data.mode === 'news'
      ? Math.max(data.slideCount - 2, 1)
      : data.slideCount;

    const slideSections = [
      data.slideStoryTitle?.trim() ? `Story Title: ${data.slideStoryTitle.trim()}` : '',
      ...(data.slideInputs || [])
      .slice(0, editableSlideCount)
      .map((slide, index) => `Slide ${index + 1}: ${slide.trim()}`)
    ].filter((slide) => slide.length > 0);

    return slideSections
      .join('\n\n');
  }

  return data.singleInput;
}

function buildNotes(data: StoryFormData): string | undefined {
  const notes = [];

  if (data.specialNotes?.trim()) {
    notes.push(data.specialNotes.trim());
  }

  if (data.inputMode === 'slideBySlide') {
    notes.push(
      'Use the provided slide-by-slide content as-is for the editable slides. Keep the final slide reserved for CTA.'
    );
  }

  return notes.length ? notes.join(' ') : undefined;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function serializeFiles(files?: File[]): Promise<string[]> {
  if (!files?.length) {
    return [];
  }

  return Promise.all(files.map((file) => fileToDataUrl(file)));
}

async function buildStoryPayload(data: StoryFormData) {
  const editableSlideCount = data.mode === 'news'
    ? Math.max(data.slideCount - 2, 1)
    : data.slideCount;

  const [attachments, imageReferences] = await Promise.all([
    serializeFiles(data.attachments),
    serializeFiles(data.customBackgrounds),
  ]);
  const includeImageReferences = data.backgroundSource === 'ai' || data.backgroundSource === 'custom';

  return {
    mode: data.mode,
    template_key: data.template,
    slide_count: data.slideCount,
    category: data.category,
    user_input: buildUserInput(data),
    notes: buildNotes(data),
    input_mode: data.inputMode,
    slide_inputs: data.inputMode === 'slideBySlide'
      ? [
          data.slideStoryTitle?.trim() || '',
          ...(data.slideInputs || []).slice(0, editableSlideCount).map((slide) => slide.trim()),
        ].filter(Boolean)
      : [],
    prompt_keywords: data.backgroundKeywords
      ? data.backgroundKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
      : [],
    image_source: mapBackgroundSourceToBackend(data.backgroundSource),
    voice_engine: mapVoiceEngineToBackend(data.voiceEngine),
    voice_id: data.voiceEngine === 'elevenlabs' ? data.voiceId?.trim() || null : null,
    attachments,
    image_references: includeImageReferences ? imageReferences : [],
  };
}

function normalizeStoryResponse(
  response: BackendStoryResponse,
  request: StoryFormData,
  apiBaseUrl: string,
): GeneratedStory {
  const primaryUrl = response.canurl || response.canurl1 || `${apiBaseUrl}/stories/${response.id}`;

  return {
    id: response.id,
    mode: response.mode,
    backendBaseUrl: apiBaseUrl,
    template: response.template_key,
    category: response.category,
    slideCount: response.slide_count,
    language: response.input_language || response.slide_deck.language_code || 'unknown',
    voiceEngine: request.voiceEngine,
    backgroundSource: request.backgroundSource,
    primaryUrl,
    htmlUrl: `${apiBaseUrl}/stories/${response.id}/html`,
    createdAt: response.created_at,
    slides: response.slide_deck.slides.map((slide, index) => ({
      number: index + 1,
      text: slide.text || '',
      imageUrl: slide.image_url,
    })),
  };
}

export async function generateStory(data: StoryFormData): Promise<GeneratedStory> {
  const apiBaseUrl = getApiBaseUrl(data.mode);
  const payload = await buildStoryPayload(data);
  const response = await fetch(`${apiBaseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate story' }));
    throw new Error(error.detail || error.message || 'Failed to generate story');
  }

  const story = (await response.json()) as BackendStoryResponse;
  return normalizeStoryResponse(story, data, apiBaseUrl);
}

export async function fetchLogs(mode: StoryMode, limit: number = 200): Promise<BackendLogsResponse> {
  const response = await fetch(`${getApiBaseUrl(mode)}/logs?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch logs' }));
    throw new Error(error.detail || error.message || 'Failed to fetch logs');
  }

  return response.json();
}

export async function fetchPromptManagement(mode: StoryMode): Promise<PromptListing> {
  const response = await fetch(`${getApiBaseUrl(mode)}/prompt-management`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch prompts' }));
    throw new Error(error.detail || error.message || 'Failed to fetch prompts');
  }

  return response.json();
}

export async function fetchTemplates(mode: StoryMode): Promise<string[]> {
  const response = await fetch(`${getApiBaseUrl(mode)}/templates`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch templates' }));
    throw new Error(error.detail || error.message || 'Failed to fetch templates');
  }

  return response.json();
}

export async function fetchTemplateManagement(mode: StoryMode): Promise<TemplateListing> {
  const response = await fetch(`${getApiBaseUrl(mode)}/template-management`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch templates' }));
    throw new Error(error.detail || error.message || 'Failed to fetch templates');
  }

  return response.json();
}

export async function createPromptVersion(mode: StoryMode, payload: PromptCreatePayload): Promise<PromptVersion> {
  const response = await fetch(`${getApiBaseUrl(mode)}/prompt-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create prompt' }));
    throw new Error(error.detail || error.message || 'Failed to create prompt');
  }

  return response.json();
}

export async function updatePromptVersion(
  mode: StoryMode,
  group: PromptGroup,
  key: string,
  version: string,
  payload: PromptUpdatePayload,
): Promise<PromptVersion> {
  const response = await fetch(
    `${getApiBaseUrl(mode)}/prompt-management/${encodeURIComponent(group)}/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update prompt' }));
    throw new Error(error.detail || error.message || 'Failed to update prompt');
  }

  return response.json();
}

export async function activatePromptVersion(
  mode: StoryMode,
  group: PromptGroup,
  key: string,
  version: string,
): Promise<PromptVersion> {
  const response = await fetch(`${getApiBaseUrl(mode)}/prompt-management/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group, key, version }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to activate prompt' }));
    throw new Error(error.detail || error.message || 'Failed to activate prompt');
  }

  return response.json();
}

export async function deletePromptVersion(
  mode: StoryMode,
  group: PromptGroup,
  key: string,
  version: string,
): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl(mode)}/prompt-management/${encodeURIComponent(group)}/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete prompt' }));
    throw new Error(error.detail || error.message || 'Failed to delete prompt');
  }
}

export async function createTemplateVersion(
  mode: StoryMode,
  payload: TemplateCreatePayload,
): Promise<TemplateVersion> {
  const response = await fetch(`${getApiBaseUrl(mode)}/template-management`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create template' }));
    throw new Error(error.detail || error.message || 'Failed to create template');
  }

  return response.json();
}

export async function updateTemplateVersion(
  mode: StoryMode,
  key: string,
  version: string,
  payload: TemplateUpdatePayload,
): Promise<TemplateVersion> {
  const response = await fetch(
    `${getApiBaseUrl(mode)}/template-management/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to update template' }));
    throw new Error(error.detail || error.message || 'Failed to update template');
  }

  return response.json();
}

export async function activateTemplateVersion(
  mode: StoryMode,
  key: string,
  version: string,
): Promise<TemplateVersion> {
  const response = await fetch(`${getApiBaseUrl(mode)}/template-management/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, version }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to activate template' }));
    throw new Error(error.detail || error.message || 'Failed to activate template');
  }

  return response.json();
}

export async function deleteTemplateVersion(
  mode: StoryMode,
  key: string,
  version: string,
): Promise<void> {
  const response = await fetch(
    `${getApiBaseUrl(mode)}/template-management/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete template' }));
    throw new Error(error.detail || error.message || 'Failed to delete template');
  }
}
