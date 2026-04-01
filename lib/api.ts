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
} from './types';

const FALLBACK_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://engine-service.azurewebsites.net';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_API_BASE_URL;

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
): GeneratedStory {
  const primaryUrl = response.canurl || response.canurl1 || `${API_BASE_URL}/stories/${response.id}`;

  return {
    id: response.id,
    mode: response.mode,
    template: response.template_key,
    category: response.category,
    slideCount: response.slide_count,
    language: response.input_language || response.slide_deck.language_code || 'unknown',
    voiceEngine: request.voiceEngine,
    backgroundSource: request.backgroundSource,
    primaryUrl,
    htmlUrl: `${API_BASE_URL}/stories/${response.id}/html`,
    createdAt: response.created_at,
    slides: response.slide_deck.slides.map((slide, index) => ({
      number: index + 1,
      text: slide.text || '',
      imageUrl: slide.image_url,
    })),
  };
}

export async function generateStory(data: StoryFormData): Promise<GeneratedStory> {
  const payload = await buildStoryPayload(data);
  const response = await fetch(`${API_BASE_URL}/stories`, {
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
  return normalizeStoryResponse(story, data);
}

export async function fetchLogs(limit: number = 200): Promise<BackendLogsResponse> {
  const response = await fetch(`${API_BASE_URL}/logs?limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch logs' }));
    throw new Error(error.detail || error.message || 'Failed to fetch logs');
  }

  return response.json();
}

export async function fetchPromptManagement(): Promise<PromptListing> {
  const response = await fetch(`${API_BASE_URL}/prompt-management`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch prompts' }));
    throw new Error(error.detail || error.message || 'Failed to fetch prompts');
  }

  return response.json();
}

export async function createPromptVersion(payload: PromptCreatePayload): Promise<PromptVersion> {
  const response = await fetch(`${API_BASE_URL}/prompt-management`, {
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
  group: PromptGroup,
  key: string,
  version: string,
  payload: PromptUpdatePayload,
): Promise<PromptVersion> {
  const response = await fetch(
    `${API_BASE_URL}/prompt-management/${encodeURIComponent(group)}/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
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
  group: PromptGroup,
  key: string,
  version: string,
): Promise<PromptVersion> {
  const response = await fetch(`${API_BASE_URL}/prompt-management/activate`, {
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
  group: PromptGroup,
  key: string,
  version: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/prompt-management/${encodeURIComponent(group)}/${encodeURIComponent(key)}/${encodeURIComponent(version)}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete prompt' }));
    throw new Error(error.detail || error.message || 'Failed to delete prompt');
  }
}
