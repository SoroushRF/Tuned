# Tuned

Tuned is an AI-powered study app that adapts to the learner instead of forcing every user through the same study flow. It builds a lightweight NeuroPrint profile from onboarding and interaction signals, then uses that profile to shape summaries, quiz questions, podcast scripts, sprint cards, and scholar mode output.

## What it does

- Learns a user profile from onboarding answers and behavior signals
- Renders a persistent NeuroPrint card with live profile values
- Turns uploaded study material into multiple study modes
- Generates:
  - Podcast mode for audio-first review
  - Sprint mode for short-burst, focus-friendly cards
  - Scholar mode for simplified side-by-side explanations
  - Quiz mode for adaptive question practice
- Supports PDF, DOCX, text, image, and audio oriented processing flows
- Uses Gemini-powered routes for content generation and transformation

## Modes

### NeuroPrint

NeuroPrint is the profile engine behind the app. It tracks three dimensions:

- `audio`
- `adhd`
- `scholar`

The values are shown in a small persistent card and can be adjusted manually when the model gets it wrong.

### Podcast Mode

Podcast mode turns content into a conversational script for audio-first review. It is designed for users who absorb better by listening than by reading.

### Sprint Mode

Sprint mode breaks content into single-concept focus cards with a one-at-a-time flow. It is built for short attention spans, task chunking, and low-friction progress.

### Scholar Mode

Scholar mode presents simplified academic content side by side with the original text and adds tooltips for harder terms. It is aimed at users who need clearer wording, more structure, or stronger language support.

### Quiz Mode

Quiz mode generates adaptive questions from the processed session. It keeps difficulty invisible to the user and uses rescue cards when an answer needs reinforcement.

### Teach Me Mode

Teach Me is the longer-term Socratic tutor direction for the project. It is documented in the product plan, but it is not the primary shipping surface in this repo right now.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- `@google/genai`
- React Flow
- pdf.js
- mammoth.js

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A Gemini API key

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

The code also accepts `NEXT_PUBLIC_GEMINI_API_KEY` in a few places, but `GEMINI_API_KEY` is the primary variable to set.

### Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Typical Flow

1. Open the app.
2. Complete the NeuroPrint onboarding.
3. Upload or process study content.
4. Review the generated output in the mode that best matches your profile.
5. Watch the NeuroPrint card update as you use the app.
6. Manually adjust the profile if the inferred values are off.

## QA and Testing Checklist

Use this as the quick manual checklist before shipping changes.

### App shell

- Home page loads cleanly on desktop and mobile
- Study page loads without console errors
- Light theme renders consistently
- No dead buttons or broken navigation

### NeuroPrint and onboarding

- Onboarding completes end to end
- Vector values persist after refresh
- NeuroPrint card appears after onboarding
- Manual override sliders update the stored profile
- Adaptive updates still work when manual override is not active

### Upload and processing

- PDFs, DOCX files, images, and audio paths are accepted or handled correctly
- Unsupported files are rejected cleanly
- Large uploads fail gracefully
- Processing returns a structured response with the expected shape
- No request hangs indefinitely

### Podcast mode

- Podcast script generation returns structured speaker segments
- Script view renders readable text
- Playback controls work
- Transcript-only fallback remains usable if audio generation fails

### Sprint mode

- Cards advance correctly
- Focus mode opens and closes cleanly
- Constellation progress updates
- Streak / milestone logic behaves consistently
- Timer behavior stays opt-in

### Scholar mode

- Simplified view renders side by side
- Tooltips appear on the intended terms
- Difficulty slider changes the explanation level
- Concept map / structured view does not break when content is sparse

### Quiz mode

- Quiz questions generate with the expected schema
- Wrong answers produce rescue cards
- Difficulty calibration does not leak to the user
- State resets cleanly between sessions

### Regression checks

- Run `npm run lint`
- Run `npm run build`
- Open the app and verify the main flows still work after any API or type change

## Gemini 2.5 Flash Consistency

The live Gemini routes should stay consistent by using the Flash family for structured, low-latency work:

- generation routes use the same response shape conventions
- quick transforms stay fast and predictable
- quiz, sprint, podcast, and scholar outputs stay aligned with the same app-level schema

Practical rules:

- Keep output JSON schemas stable across routes
- Prefer Flash for routing, scoring, and structured transforms
- Keep prompts focused and deterministic
- Validate and normalize responses before rendering them in the UI

This matters because the app depends on repeatable shapes more than poetic generation quality. A consistent Flash setup reduces latency spikes, keeps the UI responsive, and makes the study modes feel like one system instead of four separate tools.

## Project Structure

```text
Tuned/
|-- src/
|   |-- app/              # Pages and API routes
|   |-- components/       # UI components
|   |-- hooks/            # Shared hooks and state helpers
|   |-- lib/              # Gemini, NeuroPrint, and extraction logic
|   |-- store/            # App state context
|   `-- types/            # Shared TypeScript interfaces
|-- public/
|-- package.json
`-- README.md
```

## Useful Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the local dev server |
| `npm run build` | Builds the app for production |
| `npm run start` | Starts the production build |
| `npm run lint` | Runs ESLint |

## Deployment

The app is set up like a standard Next.js project and can be deployed to Vercel or another Node-compatible host.

Before deploying:

- confirm `GEMINI_API_KEY` is set in the environment
- run `npm run build`
- check the main study flows manually

## Notes

- The repo includes a large product plan in `PRODUCT_DOC.md` if you want the deeper implementation rationale.
- Teach Me mode is documented as a future layer, not the core shipping surface.
- If you change a Gemini route, update the corresponding UI expectation and validate the response shape in the browser.
