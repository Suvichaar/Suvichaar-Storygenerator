import {
  BackendLogsResponse,
  BackendStoryResponse,
  GeneratedStory,
  StoryFormData,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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

function buildStoryPayload(data: StoryFormData) {
  const editableSlideCount = data.mode === 'news'
    ? Math.max(data.slideCount - 2, 1)
    : data.slideCount;

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
    attachments: [],
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
  const response = await fetch(`${API_BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildStoryPayload(data)),
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
