# Story Generator - AI-Powered Web Stories

A production-grade Next.js application for generating AI-powered web stories with a refined, editorial interface.

## Features

### Core Functionality
- **Story Configuration**: Mode selection (News/Curious), template and category selection, slide count control, voice engine selection
- **Content Input**: Single input or slide-by-slide editing with progress tracking
- **Background Images**: Support for default, AI-generated, Pexels, or custom uploaded backgrounds
- **File Attachments**: Upload PDFs, DOCX, and images as supporting content
- **Real-time Generation**: Progress indicator with step-by-step feedback
- **Result Display**: Comprehensive result panel with metadata, slide previews, and download options

### Design & UX
- Refined dark theme with zinc/slate palette and cyan accents
- No sidebar - single-column, focused layout
- Progressive disclosure for optional features
- Smooth animations with Framer Motion
- Fully responsive design
- Accessible with keyboard navigation and focus management

### Technical Stack
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **State**: TanStack Query
- **Animations**: Framer Motion
- **Notifications**: Sonner

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main story generator page
│   └── globals.css          # Global styles
├── components/
│   ├── story-generator/     # Feature components
│   │   ├── navigation.tsx
│   │   ├── story-configuration.tsx
│   │   ├── content-input.tsx
│   │   ├── background-images.tsx
│   │   ├── attachments.tsx
│   │   ├── generation-loading.tsx
│   │   ├── result-panel.tsx
│   │   ├── segmented-control.tsx
│   │   ├── collapsible-section.tsx
│   │   ├── file-upload.tsx
│   │   └── progress-indicator.tsx
│   ├── providers/
│   │   └── query-provider.tsx
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── constants.ts        # App constants
│   ├── validation.ts       # Zod schemas
│   ├── api.ts              # API integration
│   └── utils.ts            # Utility functions
└── .env.local              # Environment variables
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Integration

The application is currently using a mock API (`mockGenerateStory` in `lib/api.ts`). To integrate with a real API:

1. Update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Replace `mockGenerateStory` with `generateStory` in `app/page.tsx`
3. Ensure your API endpoint matches the expected request/response format:

**Request**: `POST /stories/generate`
- FormData with story configuration and optional files

**Response**: JSON with `GeneratedStory` structure
```typescript
{
  id: string;
  mode: 'news' | 'curious';
  template: string;
  category: string;
  slideCount: number;
  language: string;
  voiceEngine: 'azure' | 'elevenlabs';
  backgroundSource: string;
  primaryUrl: string;
  htmlUrl: string;
  createdAt: string;
  slides: Array<{
    number: number;
    text: string;
    imageUrl?: string;
  }>;
}
```

## Customization

### Theme Colors

Edit `tailwind.config.ts` to change the accent color from cyan to your preferred color.

### Templates & Categories

Modify `lib/constants.ts` to add/remove templates and categories:

```typescript
export const TEMPLATES: Template[] = [
  { id: 'news-standard', name: 'Standard News', mode: 'news' },
  // Add more templates
];

export const CATEGORIES: Category[] = [
  { id: 'news-politics', name: 'Politics', mode: 'news' },
  // Add more categories
];
```

### Slide Limits

Adjust slide count ranges in `lib/constants.ts`:

```typescript
export const SLIDE_LIMITS: Record<StoryMode, SlideLimits> = {
  news: { min: 5, max: 12, default: 8 },
  curious: { min: 6, max: 15, default: 10 },
};
```

## Features in Detail

### Story Configuration
- **Mode**: Determines available templates, categories, and slide limits
- **Template**: Pre-defined story structures
- **Category**: Content categorization
- **Slide Count**: Number of slides with mode-specific constraints
- **Voice Engine**: Azure or ElevenLabs for narration

### Content Input Modes
- **Single Input**: One textarea for all content (URLs, text, or prompts)
- **Slide by Slide**: Individual textarea for each slide with progress tracking

### Background Images
- **Default**: System-generated backgrounds
- **AI Generated**: Keywords-based AI generation
- **Pexels**: Stock photo integration
- **Custom Upload**: User-provided images

### Generation Process
1. Validates form data with Zod
2. Shows uploading → generating → finalizing progress
3. Displays results inline with smooth animations
4. Provides download and regeneration options

## Accessibility

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Sufficient color contrast
- Screen reader compatible

## Performance

- Optimized with Next.js 14
- Static generation where possible
- Lazy loading for images
- Efficient re-renders with React Hook Form
- Debounced validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
