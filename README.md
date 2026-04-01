# Story Generator Frontend

Next.js frontend for creating AI-powered web stories and managing versioned text/image prompts used by the backend.

## What This App Does

- Create web stories from article URLs, pasted text, or slide-by-slide input
- Choose story template, category, slide count, voice engine, and image source
- Use default, AI-generated, Pexels, or uploaded background images
- View backend logs from the UI
- Manage prompt versions from the frontend:
  - text prompts
  - image prompts
  - activate/deactivate versions
  - create, update, delete prompt versions

## Current Stack

- Next.js 13 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Sonner

## Project Structure

```text
Suvichaar-Storygenerator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── providers/
│   │   └── query-provider.tsx
│   ├── story-generator/
│   │   ├── attachments.tsx
│   │   ├── background-images.tsx
│   │   ├── content-input.tsx
│   │   ├── generation-loading.tsx
│   │   ├── log-viewer.tsx
│   │   ├── navigation.tsx
│   │   ├── prompt-management.tsx
│   │   ├── progress-indicator.tsx
│   │   ├── result-panel.tsx
│   │   └── story-configuration.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── constants.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validation.ts
└── .env.local
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Backend running locally on port `8000`

### Install

```bash
npm install
```

### Environment

Copy the sample env:

```bash
cp .env.example .env.local
```

Recommended local values:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

Important:
- use the backend base URL directly
- do not use `http://localhost:3001/api`
- this frontend talks to the Python backend, not a Next.js API route

### Run

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open:

```text
http://127.0.0.1:3001
```

## Backend Dependency

This frontend expects the backend to expose at least:

- `POST /stories`
- `GET /logs`
- `GET /prompt-management`
- `POST /prompt-management`
- `PUT /prompt-management/{group}/{key}/{version}`
- `POST /prompt-management/activate`
- `DELETE /prompt-management/{group}/{key}/{version}`

If the frontend is running on `127.0.0.1:3001`, the backend must allow that origin in CORS.

## Main UI Areas

### Story Generator

Used for normal story generation.

Features:
- mode/category/template selection
- single-input or slide-by-slide content entry
- voice selection
- image source selection
- attachments
- generated story result panel

### Prompt Management

Used for managing versioned prompt files from the UI.

Supports:
- `text_prompts`
- `image_prompts`
- filter by:
  - all
  - active
  - inactive
- create prompt version
- edit prompt version
- delete prompt version
- activate a version

The navbar also shows currently active prompt versions for quick confirmation.

## Prompt Field Meaning

These definitions are surfaced in the UI as well.

### System Prompt

Tells the AI what role it should play and how it should behave.

Simple example:

```text
You are like a senior news editor.
Write clear, factual story text.
```

### User Prompt Template

The actual message shape sent to the AI each time.
The app fills placeholders before sending it.

Simple example:

```text
Language: {language}
Focus Keywords: {keywords}
Signal Analysis:
{analysis}
```

### Required Placeholders

These are the variable names the app must supply at runtime.

Simple example:

```text
language, keywords, analysis
```

Meaning:
- if the template contains `{language}`, backend must provide a `language` value
- placeholders do not decide values
- backend logic decides values, then fills them in

Example:

```text
Special notes: make it Hindi
backend decides language = hi
template uses {language}
final prompt becomes Language: hi
```

## Image Generation Notes

Current AI-image behavior in the backend:

- AI-generated images are raster images, not vector images
- the active provider path uses `FLUX.2-pro`
- generation request is square:
  - `1024 x 1024`
- story rendering then maps/resizes them for portrait display in templates
  - commonly `720 x 1280` cover-fit style usage in the rendering layer

So the rough flow is:

```text
generate 1024x1024 image
-> store/upload
-> render as portrait story background
```

## Useful Commands

Run dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Typecheck:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Start production build:

```bash
npm run start
```

## Common Local Issues

### Prompt Management says "Failed to fetch"

Check:
- backend is running on `127.0.0.1:8000`
- `.env.local` points to `http://127.0.0.1:8000`
- backend CORS includes:
  - `http://127.0.0.1:3001`
  - optionally `http://localhost:3001`

### Backend works but old story HTML still shows old placeholders

Old already-generated stories may still contain stale rendered HTML.
Generate a new story after template or renderer changes.

### Next dev server starts but browser still shows stale UI

Try:
- hard refresh
- restart frontend dev server
- clear `.next` if needed

## Notes

- This repo currently uses the backend directly, not a mock API
- Prompt Management depends on the backend prompt CRUD endpoints
- Story output depends on both frontend request payloads and backend rendering logic
