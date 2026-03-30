import { StoryFormData, GeneratedStory } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export async function generateStory(data: StoryFormData): Promise<GeneratedStory> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        if (value[0] instanceof File) {
          value.forEach((file) => formData.append(key, file));
        } else {
          formData.append(key, JSON.stringify(value));
        }
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await fetch(`${API_BASE_URL}/stories/generate`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate story' }));
    throw new Error(error.message || 'Failed to generate story');
  }

  return response.json();
}

export async function mockGenerateStory(data: StoryFormData): Promise<GeneratedStory> {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return {
    id: `story-${Date.now()}`,
    mode: data.mode,
    template: data.template,
    category: data.category,
    slideCount: data.slideCount,
    language: 'en',
    voiceEngine: data.voiceEngine,
    backgroundSource: data.backgroundSource,
    primaryUrl: `https://stories.example.com/${Date.now()}`,
    htmlUrl: `https://stories.example.com/${Date.now()}/download`,
    createdAt: new Date().toISOString(),
    slides: Array.from({ length: data.slideCount }, (_, i) => ({
      number: i + 1,
      text: `This is the content for slide ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      imageUrl: i % 2 === 0 ? `https://images.pexels.com/photos/1${i}/pexels-photo-1${i}.jpeg` : undefined,
    })),
  };
}
