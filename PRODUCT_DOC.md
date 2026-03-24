# Nuro — Product & Build Document
> **Working title:** Nuro (final name TBD — contenders: Nuro, Flowstate, Prisma, Koru)
> **Competition:** GDG UTSC AI Case Competition 2026 — "Build with AI"
> **Submission deadline:** March 25, 2026 · 12:00 PM EST
> **Team:** Soroush · Parsa
> **Stack:** Next.js · Tailwind CSS · Gemini API · Firebase (Could) · React Flow

---

## Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Core Concept — The NeuroPrint Engine](#2-core-concept--the-neuroprint-engine)
3. [Tech Stack & Model Strategy](#3-tech-stack--model-strategy)
4. [NeuroPrint Vector System](#4-neuroprint-vector-system)
5. [Learner Profiles & Feature Visibility Rules](#5-learner-profiles--feature-visibility-rules)
6. [Feature Definitions](#6-feature-definitions)
7. [User Flows](#7-user-flows)
8. [Input Pipeline](#8-input-pipeline)
9. [Project Directory Structure](#9-project-directory-structure)
10. [MoSCoW Prioritization](#10-moscow-prioritization)
11. [Team Task Breakdown & File Ownership](#11-team-task-breakdown--file-ownership)
12. [Comprehensive Task Table](#12-comprehensive-task-table)
13. [Teach Me Mode — Decision Record](#13-teach-me-mode--decision-record)
14. [Decision Log](#14-decision-log)
15. [Changelog](#15-changelog)

---

## 1. Overview & Vision

### What is Nuro?

Nuro is an AI-powered adaptive study companion that transforms any academic content into a personalized learning experience shaped by *how a specific student actually learns* — not how a generic student is assumed to learn.

The core thesis: **every other team will build a content transformer. We build a learner.**

Most EdTech AI tools take a static input and produce a static output: upload notes → get flashcards. Nuro inverts this. It first builds a behavioral model of the user — their NeuroPrint — through a short, indirect onboarding questionnaire. Then every output the app produces (summaries, quizzes, breakdowns, audio scripts) is filtered and shaped by that model. The model also updates in real-time based on how the user interacts with content: what they skip, what they get wrong, how long they spend on things.

### Why it wins

- **Judges are Google-affiliated.** Leaning hard into Gemini 3.1 Pro's multimodal capabilities is both technically correct and a political advantage.
- **No other team will have a live adaptive profile.** They'll build upload → transform. We build upload → understand you → transform accordingly → adapt further.
- **It covers all three brief personas** (Multi-Modal Learner, ADHD Focus-Seeker, Global Scholar) not as discrete modes but as a blended continuous vector, which is both more technically sophisticated and more true to reality.
- **The wow moment is visible**: a persistent NeuroPrint card the user can watch update in real-time as the app learns them.

### Problem it solves (from the brief)

> *"Students whose first language is not English, or who have neurodivergent profiles, often require additional time to process academic materials due to increased cognitive load."*

Standard study tools are built for one learner archetype. Nuro has no default archetype — it derives yours.

---

## 2. Core Concept — The NeuroPrint Engine

The NeuroPrint Engine is the central system that runs underneath everything else. It is not a feature. It is the product's foundation.

**What it does:**
- Runs a 5-question behavioral onboarding + 1 explicit self-identification question on first launch
- Produces a float vector `{ audio: Float, adhd: Float, scholar: Float }` normalized to [0, 1]
- Persists this vector in localStorage (and optionally Firebase if auth is implemented)
- Updates the vector automatically based on in-session behavior signals
- Controls which features are shown, which are suggested, and which are hidden — based on threshold logic
- Exposes a manual override UI so users can correct the model themselves

**What makes it different from a settings page:**
A settings page requires self-awareness ("I am an ADHD learner") and conscious configuration. NeuroPrint requires neither — it infers from behavior proxies and adapts passively. The user never has to know how it works. They just feel like the app gets them.

---

## 3. Tech Stack & Model Strategy

### Frontend
- **Next.js 14** (App Router) — fast dev, easy API routes for link fetching and DOCX parsing, clean file structure for split team work
- **Tailwind CSS** — rapid styling, consistent design system
- **React Flow** — interactive concept map rendering in Teach Me mode
- **pdf.js** — client-side PDF text + image extraction (no backend needed)
- **mammoth.js** — client-side DOCX text + image extraction

### AI Models

| Model | Use Case | Why |
|---|---|---|
| `gemini-2.5-pro-preview` | Onboarding analysis, full content processing, quiz generation, Socratic tutor | Highest capability, 1M context, native multimodal (text, image, audio, PDF) |
| `gemini-2.5-flash` | Streaming quiz scoring, profile delta updates, tooltip generation, fast transforms | Low latency, low cost, 1M context — "reflex" operations |
| `gemini-2.5-flash-lite` | Fallback for high-volume low-stakes calls | Cheapest, fastest in the family |

**Why Gemini over OpenAI or Claude for this project:**
- Native PDF and image input without preprocessing — critical for multi-upload pipeline
- 1M token context means we can send entire processed sessions in one call
- GDG UTSC judges are Google-affiliated — Gemini is the right story to tell
- Google AI Studio free tier is sufficient for demo purposes

**Why not local models (RTX 4070 / 8GB VRAM):**
The 4070 has 8GB VRAM. Capable models for this task (Llama 3.1 70B, Qwen2.5 72B) require 40GB+ for reasonable quality. Smaller models (7B–13B) lack the instruction-following quality needed for reliable JSON output, nuanced Socratic dialogue, and multilingual academic content. Local is a stretch goal / pitch talking point: *"this architecture could run offline with future hardware."*

### State Management
- **React Context + `useReducer`** for NeuroPrint vector, session state, quiz state
- **localStorage** for persistence without auth
- **Firebase Firestore** (Could) for cross-device persistence

### No dedicated backend
All Gemini calls go through Next.js API routes (`/api/gemini/*`). The Gemini API key lives in `.env.local`. Link fetching and DOCX/PDF parsing run through API routes. No standalone server needed — keeps deployment to Vercel trivial.

---

## 4. NeuroPrint Vector System

This section documents the full technical logic of the NeuroPrint system. It is the most important system in the product.

### 4.1 The Vector

```typescript
interface NeuroPrintVector {
  audio: number;    // [0, 1] — preference for audio/spoken content
  adhd: number;     // [0, 1] — need for short bursts, gamification, focus mode
  scholar: number;  // [0, 1] — language simplification, tooltips, side-by-side
  manualOverride: boolean; // if true, adaptive updates stop for manually-set dimensions
  lastUpdated: number; // Unix timestamp
}
```

No dimension is binary. A user can be 0.8 audio and 0.6 adhd simultaneously. The system does not force them into a single archetype.

### 4.2 Onboarding — Building the Initial Vector

**Phase 1: Behavior-proxy questions (5 questions)**

Each question has 4 options + a free-text fallback ("None of these fit me — "). Each option carries a hidden weight delta applied to the vector. Options are designed to feel natural and specific — never like a personality test.

Example questions and their hidden weight logic:

---

**Q1 — Attention proxy**
> *"You open YouTube to 'quickly check something' before studying. 45 minutes later, what happened?"*
> - A) I got sucked into a documentary or explainer video → `audio: +0.12, adhd: +0.05`
> - B) I have 14 tabs open and forgot what I was looking for → `adhd: +0.18`
> - C) I watched something in another language → `scholar: +0.10`
> - D) I closed it and opened my notes. I hate wasting time → `adhd: -0.05` (high focus tolerance)

**Q2 — Learning modality proxy**
> *"A concept finally 'clicks' for you. What just happened?"*
> - A) Someone drew it out or showed me a visual → `audio: +0.08, adhd: +0.05`
> - B) I heard a story or real-world example → `audio: +0.15`
> - C) I re-read it slowly by myself → `scholar: +0.10, adhd: -0.05`
> - D) Someone quizzed me and I had to retrieve it → `adhd: +0.10`

**Q3 — Focus duration proxy**
> *"Honest answer: how long into a lecture before your mind goes somewhere else?"*
> - A) I'm gone within 10 minutes → `adhd: +0.20`
> - B) Around 25–30 minutes I start drifting → `adhd: +0.10`
> - C) Depends entirely on how interesting it is → `adhd: +0.05`
> - D) I stay locked in if I care about the topic → `adhd: +0.00`

**Q4 — Language comfort proxy**
> *"You're reading a dense academic paper. What's actually slowing you down?"*
> - A) The vocabulary — I keep hitting words I don't know → `scholar: +0.20`
> - B) The sentence structure — it's too nested and long → `scholar: +0.15`
> - C) I lose track of the argument across paragraphs → `adhd: +0.10, scholar: +0.05`
> - D) Nothing really — I read fast → `scholar: -0.05`

**Q5 — Content format proxy**
> *"You need to review 40 pages of notes the night before an exam. What do you actually do?"*
> - A) Read them out loud or wish I had a recording → `audio: +0.20`
> - B) Break them into small chunks and tackle one at a time → `adhd: +0.15`
> - C) Read slowly and carefully, highlighting key terms → `scholar: +0.12`
> - D) Make a practice test and drill myself → `adhd: +0.08`

---

**Phase 2: Explicit self-identification (1 question, higher weight)**

> *"Last one — any of these sound like you? Pick all that apply."*
> - ☐ I learn better by listening than reading → `audio: +0.35`
> - ☐ I struggle to focus for long stretches → `adhd: +0.35`
> - ☐ English isn't my first language, or academic writing slows me down → `scholar: +0.35`

Rationale: explicit self-identification is weighted at +0.35 per selection — approximately 2–3× the weight of any single behavior-proxy answer. The user knows themselves. If they check a box, that signal is strong.

**Phase 3: Vector normalization**

After all answers are accumulated, the raw sums are normalized to [0, 1] using min-max scaling across the session. The final vector is stored immediately.

### 4.3 Feature Visibility Thresholds

| Score Range | Behavior | Rationale |
|---|---|---|
| ≥ 0.55 | Feature **fully active**, shown prominently in UI | Strong signal — this is clearly part of their profile |
| 0.25 – 0.54 | Feature **suggested** via soft chip/tooltip, not forced | Medium signal — worth offering, not worth imposing |
| < 0.25 | Feature **completely hidden** | Weak signal — showing it adds cognitive load with no benefit |

The threshold constants (`SHOW_THRESHOLD = 0.55`, `SUGGEST_THRESHOLD = 0.25`) are defined in `/lib/neuroprint/thresholds.ts` as exported constants so they can be tuned without touching logic files.

### 4.4 Real-Time Adaptive Updates

In-session behavioral signals update the vector automatically (unless `manualOverride: true`):

| Signal | Delta |
|---|---|
| User skips/fast-forwards audio output twice | `audio: -0.05` |
| User completes audio fully, plays again | `audio: +0.05` |
| User activates sprint mode voluntarily | `adhd: +0.08` |
| User dismisses sprint timer repeatedly | `adhd: -0.05` |
| User drags difficulty slider toward "simpler" | `scholar: +0.07` |
| User drags difficulty slider toward "original" | `scholar: -0.05` |
| Quiz: 3 correct in a row | internal difficulty nudge up (not vector update) |
| Quiz: 2 wrong in a row | internal difficulty nudge down (not vector update) |

Vector updates are debounced — they apply after a signal is observed 2× in a session to avoid noise from accidental interactions.

### 4.5 Manual Override

A persistent `⚙ Adjust my profile` button on the NeuroPrint card opens a 3-slider panel:

```
Audio        [——●——————] 0.7
Focus Mode   [————●————] 0.4
Scholar      [●—————————] 0.1
```

- Moving any slider sets `manualOverride: true` for that dimension
- Adaptive updates stop for overridden dimensions
- Label: *"Not feeling the suggestions? Tune it yourself."*
- A soft `Reset to learned values` link is available below the sliders

### 4.6 The Visible NeuroPrint Card

Always visible in the top-right corner of the app after onboarding. Small, non-intrusive. Shows:

```
┌─────────────────────┐
│ 🧠 Your NeuroPrint  │
│ Audio        ████░░  │
│ Focus Mode   ██░░░░  │
│ Scholar      █░░░░░  │
│ Adapting... ↑ audio  │
│          ⚙ Adjust   │
└─────────────────────┘
```

When an adaptive update fires, the relevant bar animates for 1 second. This is the *live wow moment* — judges watching the demo see the app visibly learning the user.

---

## 5. Learner Profiles & Feature Visibility Rules

Profiles are not modes. They are emergent from the vector. A user with `{ audio: 0.8, adhd: 0.6, scholar: 0.3 }` gets the audio and ADHD feature sets fully active, scholar partially suggested, and the UI layout weights output panels accordingly.

### Audio Profile (high `audio` dimension)

**Core need:** Content delivered as sound, not as text to read.

**Feature set:**
- Podcast Script output: content transformed into a conversational A/B dialogue script between two voices
- Browser Web Speech API playback with two pitch-differentiated voices
- Script is the *primary* output panel — summary moves to secondary
- Playback controls: play/pause, 1.25×/1.5× speed, skip 15s

**Design rules:**
- The script must not sound like a textbook read aloud. It must sound like a real conversation.
- Prompt engineering is critical here: instruct Gemini to write informally, use contractions, include "wait, but what about..." style interruptions between the two voices.
- Playback should work with screen locked on mobile.

### ADHD Profile (high `adhd` dimension)

**Core need:** Short bursts, visible progress, one thing at a time, no overwhelm.

**Feature set:**
- Sprint Cards: one concept per card, full-screen focus mode, all nav hidden
- Constellation progress: nodes light up as sprints complete, full shape only revealed at end
- Optional countdown timer (off by default, offered after first card completion)
- Streak counter
- Rescue cards on wrong quiz answers
- Milestone messages after every 3 sprints

**Design rules:**
- **Never show how many cards remain upfront.** The constellation obscures the total until done.
- **Timer is opt-in, framed as a power-up** ("Want to try sprint mode?"), never as a deadline.
- Progress language is always additive ("You've covered 4 concepts") never subtractive ("7 remaining").
- Rescue cards copy: "Let's look at this differently —" never "Incorrect."
- Sprint card UI: single concept title, 3 bullet points max, one optional diagram, one challenge question.

### Scholar Profile (high `scholar` dimension)

**Core need:** Language simplification without losing academic accuracy. Exam-anchored.

**Feature set:**
- Side-by-side panel: original text left, simplified right, difficult terms underlined in amber
- Difficulty slider: 4-point scale from "Simplified" to "Original," persists per session
- Inline tooltip cards on hover: plain-language definition + exam relevance note
- Auto-generated concept map below the panel (React Flow, max 6 nodes)
- Quiz questions written in clear, non-idiomatic English

**Design rules:**
- Simplification never dumbs down the concept — only the language. Technical terms must survive.
- Tooltips must always include an "📝 Exam note:" section connecting the term to likely test formats.
- The difficulty slider starting position is set from the `scholar` vector score: 0.9 = full simplified, 0.5 = midpoint.
- The slider position itself is a behavioral signal — dragging it updates the vector.

### Blended Profiles

When 2 or 3 dimensions are ≥ 0.55, all active feature sets are rendered together. Layout weighting:

```
Panel width = (dimension score / sum of active scores) × available width
```

Example: `{ audio: 0.8, adhd: 0.7, scholar: 0.2 }` → audio panel ~53% width, sprint cards ~47% width, scholar suggested via chip only.

When a feature from a suggested dimension (0.25–0.54) would complement the primary experience, it appears as a **soft chip** below the primary panel: *"Want to try sprint mode alongside this? Some people find it helps."* One chip maximum per session — not spammed.

---

## 6. Feature Definitions

### F1 — Onboarding Flow

**Definition:** 6-question adaptive intake that builds the initial NeuroPrint vector. Shown once on first launch. Re-triggerable from settings.

**Musts:**
- All questions present as option cards (4 options per question) — never open text fields as primary input
- Every question has a free-text fallback: "None of these — " below the option cards
- Explicit self-identification question is always last
- NeuroPrint card appears immediately after completion with a brief explanation
- Total time to complete: under 90 seconds

**Don'ts:**
- Never use loaded language that pre-assumes a profile ("As someone with ADHD...")
- Never ask directly "How do you learn best?" — use proxy behaviors instead
- Never show the vector scores during onboarding
- Never make the free-text fallback look secondary or hidden

**Checklist:**
- [ ] 5 behavior-proxy questions written and weighted
- [ ] Explicit self-identification question (multi-select)
- [ ] Free-text fallback on all 6 questions
- [ ] Vector calculation logic implemented and tested
- [ ] NeuroPrint card animates in on completion
- [ ] Onboarding state persisted — never shows twice unless reset

---

### F2 — Upload Desk

**Definition:** The unified input surface where users bring in academic content before processing.

**Supported input types:**
| Type | Method | Limit |
|---|---|---|
| Text | Paste into textarea | 50,000 characters |
| PDF | File upload → pdf.js client-side extraction | 20MB, max 3 per session |
| Image (JPG/PNG) | File upload or camera capture → Gemini Vision | 10MB, max 5 per session |
| DOCX | File upload → mammoth.js client-side extraction | 10MB, max 3 per session |
| Audio | File upload → Gemini audio transcription | 25MB, max 2 per session |
| Link | URL input → Next.js API route fetches + strips HTML | 10s timeout, max 15K tokens returned |
| Target exam | Any of the above, tagged as "exam/syllabus" context | Same per-type limits |
| Quick note | Text or voice after main upload | 1000 characters / 60s audio |

**Session collective limit:** 100MB total across all inputs. A usage bar shows `47MB / 100MB used this session`.

**Musts:**
- Drag-and-drop multi-file support
- Visual confirmation for each uploaded item (filename, type icon, size)
- Processing doesn't begin until user explicitly hits "Process" — they can add multiple files first
- Graceful failure messages: paywalled links, corrupt PDFs, oversized files
- Raw files dropped from memory after extraction — only processed text persists

**Don'ts:**
- Never silently fail — every error must surface a human-readable message
- Never block the UI during upload — show progress per file
- Never store raw uploaded files in Firebase — only extracted text

**Checklist:**
- [ ] Textarea for paste
- [ ] File upload with drag-and-drop (PDF, image, DOCX, audio)
- [ ] Camera capture (mobile browser)
- [ ] Link input with Next.js API route fetcher
- [ ] pdf.js integration
- [ ] mammoth.js integration
- [ ] Session limit tracker (100MB bar)
- [ ] Per-type limit enforcement
- [ ] Target exam upload (tagged separately)
- [ ] Quick note field (text + optional voice)
- [ ] "Process" button triggers unified Gemini pipeline

---

### F3 — Podcast Script (Audio Profile)

**Definition:** Content transformed into a natural two-voice conversational script and played back via browser TTS.

**Musts:**
- Script written by Gemini in dialogue format (Speaker A / Speaker B)
- Voices differentiated by pitch using Web Speech API `SpeechSynthesisUtterance.pitch`
- Playback works with mobile screen locked
- Script also visible as text (accessible, copyable)
- Speed controls: 1×, 1.25×, 1.5×

**Don'ts:**
- Script must not sound like a textbook read aloud — Gemini prompt must explicitly instruct casual, conversational tone with interruptions and "wait, but..." transitions
- Don't autoplay — user initiates

**Checklist:**
- [ ] Gemini prompt for podcast script generation (tuned by NeuroPrint)
- [ ] Script rendered as readable text
- [ ] Web Speech API playback with dual voice
- [ ] Speed controls
- [ ] Mobile screen-lock playback tested

---

### F4 — Sprint Cards (ADHD Profile)

**Definition:** Content broken into single-concept cards shown one at a time in full-screen focus mode.

**Musts:**
- Focus mode: nav hidden, background dims, single card on screen
- One concept title, max 3 bullets, one optional visual, one challenge question
- Constellation progress tracker (total count hidden until completion)
- Streak counter visible at all times in focus mode
- Optional sprint timer (off by default, offered after card 1)
- Milestone message every 3 completed cards
- Session state saved — user can resume if they leave

**Don'ts:**
- Never show total card count before the session begins
- Never use language like "X remaining" — only "X completed"
- Timer must be opt-in, never default-on
- Rescue cards must never use the word "wrong" or "incorrect"

**Checklist:**
- [ ] Gemini content chunking prompt (one concept per card)
- [ ] Sprint Card UI component (full-screen focus mode)
- [ ] Constellation progress component
- [ ] Streak counter
- [ ] Optional countdown timer with opt-in prompt
- [ ] Milestone message component (every 3 cards)
- [ ] Session save/resume logic
- [ ] Rescue card component

---

### F5 — Scholar Side-by-Side (Scholar Profile)

**Definition:** Dense academic text rendered side-by-side with a simplified version, with inline term tooltips and a difficulty slider.

**Musts:**
- Original text on left, simplified on right
- Difficult terms underlined in amber on both panels
- Tooltip on hover: plain definition + exam relevance note
- Difficulty slider: 4 points (Simplified ← → Original), persists per session
- Slider position updates scholar vector dimension (adaptive signal)
- Concept map below panel (React Flow, max 6 nodes, JSON from Gemini)

**Don'ts:**
- Simplification must never lose technical accuracy — only language complexity changes
- Tooltip must always include exam relevance — never just a dictionary definition
- Concept map must not exceed 6 nodes in MVP — complexity adds confusion

**Checklist:**
- [ ] Gemini prompt for side-by-side simplification (tuned by NeuroPrint + slider position)
- [ ] Side-by-side layout component
- [ ] Amber underline for key terms
- [ ] Tooltip component (definition + exam note)
- [ ] Difficulty slider component (4-point)
- [ ] Slider → vector update signal
- [ ] Gemini prompt for concept map JSON output
- [ ] React Flow concept map component

---

### F6 — Quiz System (Universal)

**Definition:** Quiz mode available across all profiles. Difficulty scales invisibly. Rescue cards for wrong answers.

**Difficulty logic (invisible to user):**
- Starting difficulty set from NeuroPrint: high adhd score → starts harder (builds on "gets bored fast" signal)
- Correct on first attempt → difficulty nudges up silently
- Wrong answer → rescue card spawns (same concept, different angle)
- Wrong again on rescue → difficulty drops one level silently
- Difficulty level is never displayed anywhere in the UI

**Musts:**
- One question at a time — never a 10-question quiz form
- Wrong answer triggers rescue card: "Let's look at this differently —"
- Second failure silently drops difficulty — no notification to user
- Streak counter shared with Sprint Cards
- Quiz questions tuned to profile: clear non-idiomatic English for scholar, retrieval-style for adhd, analogy-based for audio

**Don'ts:**
- Never show a difficulty indicator ("Easy / Medium / Hard")
- Never penalize with negative language — failed answers are reframes, not corrections
- Never drop difficulty visibly — the only signal the user has is question content

**Checklist:**
- [ ] Quiz question generation prompt (profile-tuned)
- [ ] Answer input (text or multiple choice depending on question type)
- [ ] Answer evaluation via Gemini Flash
- [ ] Rescue card generation prompt
- [ ] Invisible difficulty state machine
- [ ] Streak integration

---

### F7 — Target Exam Mode

**Definition:** User uploads a past exam, syllabus, or list of learning objectives. All subsequent content processing is anchored to those targets — relevant material is elevated, irrelevant material is de-emphasized.

**Musts:**
- Exam/syllabus parsed and concept list extracted at upload time
- All Gemini content processing prompts include extracted target concepts
- NeuroPrint card shows: "Exam target: active — 8 concepts flagged"
- Flagged concepts visually marked in all output panels

**Don'ts:**
- Don't over-flag — only concepts with strong match to target should be marked
- Don't replace the full content with only flagged material — de-emphasize, don't hide

**Checklist:**
- [ ] Target upload UI (tagged separately from study material)
- [ ] Target concept extraction prompt
- [ ] Concept flagging integration into all output prompts
- [ ] NeuroPrint card "exam target active" indicator
- [ ] Visual flagging in study surface panels

---

## 7. User Flows

### 7.1 First-Time User Flow

```
1. Land on home screen
   → Single centered card: "Let's figure out how you learn."
   → CTA: "Start (takes 90 seconds)"

2. Onboarding — Question 1 of 6
   → Option cards displayed (4 options)
   → Free-text fallback below options
   → Progress dots at top (no numbers — just 6 dots)
   → "Next" enabled on any selection

3. Questions 2–5
   → Same format, different content
   → Vector accumulating silently in background

4. Question 6 — Explicit self-identification
   → Multi-select checkboxes
   → "Pick all that apply — you can choose multiple"
   → Free-text fallback

5. NeuroPrint card animates in
   → Brief one-line explanation: "We built your learning profile. It'll adapt as you use the app."
   → CTA: "Start studying"

6. Land on Upload Desk
   → NeuroPrint card visible top-right
   → Upload surface center-stage
```

### 7.2 Core Study Session Flow

```
1. Upload Desk
   → User drags in files / pastes text / enters a link
   → (Optional) uploads target exam
   → (Optional) adds a quick note
   → Session limit bar updates as files are added
   → Hits "Process"

2. Processing state
   → Subtle loading animation
   → Shows what's being processed ("Reading your PDF... Extracting images...")

3. Study Surface renders
   → Layout determined by NeuroPrint vector
   → High audio: Podcast Script panel primary
   → High adhd: First Sprint Card loads immediately in focus mode
   → High scholar: Side-by-side panel primary
   → Blended: panels sized by weight

4. User interacts with content
   → Behavioral signals fire
   → NeuroPrint card updates (bars animate on change)
   → Difficulty slider available (scholar)
   → "Test me on this" button always accessible

5. Quiz triggered
   → One question appears
   → Correct → streak up, difficulty nudge
   → Wrong → rescue card ("Let's look at this differently")
   → Wrong again → difficulty drops silently

6. Session end (optional)
   → Summary: concepts covered, quiz accuracy, streak
   → "Come back to this" saves session to localStorage (or Firebase if auth)
```

### 7.3 Returning User Flow

```
1. Land on home screen
   → NeuroPrint card shows immediately (loaded from localStorage/Firebase)
   → Onboarding skipped
   → Option to resume last session or start new

2. If resuming:
   → Upload Desk pre-populated with last session's processed content
   → Sprint Card resumes at last position
   → Quiz difficulty at last calibrated level

3. If new session:
   → Upload Desk blank
   → NeuroPrint persisted — no re-onboarding
```

### 7.4 Manual Override Flow

```
1. User clicks ⚙ on NeuroPrint card (any screen)

2. Slider panel slides in
   → Three sliders: Audio / Focus Mode / Scholar
   → Current values shown
   → "Reset to learned values" link below

3. User adjusts slider
   → UI updates immediately
   → Features appear/disappear in real-time based on new thresholds
   → manualOverride: true set for adjusted dimensions

4. User closes panel
   → State saved
   → Adaptive updates resume for non-overridden dimensions only
```

---

## 8. Input Pipeline

### Processing Architecture

All content — regardless of input type — is normalized to a common intermediate format before hitting the Gemini study processing prompt:

```
[Raw Input] → [Type-specific extractor] → [NormalizedContent] → [Gemini Study Pipeline]
```

```typescript
interface NormalizedContent {
  textBlocks: string[];      // extracted text segments
  imageBlocks: string[];     // base64 encoded images
  sourceType: InputType;     // 'pdf' | 'image' | 'text' | 'docx' | 'audio' | 'link'
  targetConcepts?: string[]; // populated if target exam was also uploaded
  userNote?: string;         // optional quick note appended
}
```

### Extractor Details

| Input | Extractor | Where it runs |
|---|---|---|
| Text paste | Direct — no extraction | Client |
| PDF | pdf.js — extracts text per page + images as base64 | Client |
| Image | Direct base64 encode | Client |
| DOCX | mammoth.js — extracts text + embedded images | Client |
| Audio | Sent to Gemini audio transcription endpoint | API route |
| Link | Next.js API route: fetch → cheerio strip HTML → return clean text | Server (API route) |

### Link Fetcher Failure Handling

- Timeout: 10 seconds
- On timeout: `"Couldn't load that page — try pasting the content directly."`
- On 403/401 (paywall): `"This page requires a login. Copy the text and paste it instead."`
- Max returned content: 15,000 tokens (truncated with a note if exceeded)

---

## 9. Project Directory Structure

```
nuro/
├── app/
│   ├── page.tsx                    # Home / landing
│   ├── onboarding/
│   │   └── page.tsx                # Onboarding flow
│   ├── study/
│   │   └── page.tsx                # Main study surface
│   └── api/
│       ├── gemini/
│       │   ├── process/route.ts    # Main content processing endpoint
│       │   ├── quiz/route.ts       # Quiz generation + scoring
│       │   ├── podcast/route.ts    # Podcast script generation
│       │   └── conceptmap/route.ts # Concept map JSON generation
│       └── fetch-link/route.ts     # URL fetch + HTML strip
│
├── components/
│   ├── onboarding/
│   │   ├── QuestionCard.tsx        # Single question with options
│   │   ├── OptionButton.tsx        # Individual option card
│   │   ├── FreeTextFallback.tsx    # "None of these" input
│   │   └── OnboardingProgress.tsx  # 6-dot progress indicator
│   ├── neuroprint/
│   │   ├── NeuroPrintCard.tsx      # Persistent top-right card
│   │   ├── OverrideSliders.tsx     # Manual override panel
│   │   └── ProfileBar.tsx          # Animated dimension bar
│   ├── upload/
│   │   ├── UploadDesk.tsx          # Main upload surface
│   │   ├── FileDropZone.tsx        # Drag-and-drop zone
│   │   ├── LinkInput.tsx           # URL input field
│   │   ├── QuickNote.tsx           # Post-upload note field
│   │   └── SessionLimitBar.tsx     # 100MB usage indicator
│   ├── study/
│   │   ├── StudySurface.tsx        # Adaptive layout controller
│   │   ├── podcast/
│   │   │   ├── PodcastPanel.tsx    # Script + playback controls
│   │   │   └── ScriptView.tsx      # Text view of script
│   │   ├── sprint/
│   │   │   ├── SprintCard.tsx      # Single focus card
│   │   │   ├── ConstellationProgress.tsx
│   │   │   ├── SprintTimer.tsx     # Opt-in countdown
│   │   │   └── MilestoneToast.tsx  # "3-sprint streak!" message
│   │   └── scholar/
│   │       ├── SideBySidePanel.tsx
│   │       ├── DifficultySlider.tsx
│   │       ├── TermTooltip.tsx
│   │       └── ConceptMap.tsx      # React Flow wrapper
│   └── quiz/
│       ├── QuizCard.tsx            # Single question view
│       ├── RescueCard.tsx          # Wrong answer recovery
│       └── StreakCounter.tsx
│
├── lib/
│   ├── gemini/
│   │   ├── client.ts               # Gemini API client setup
│   │   ├── prompts/
│   │   │   ├── process.ts          # Content processing prompt builder
│   │   │   ├── podcast.ts          # Podcast script prompt builder
│   │   │   ├── quiz.ts             # Quiz generation prompt builder
│   │   │   └── conceptmap.ts       # Concept map JSON prompt builder
│   │   └── models.ts               # Model name constants
│   ├── neuroprint/
│   │   ├── engine.ts               # Vector calculation logic
│   │   ├── thresholds.ts           # SHOW_THRESHOLD, SUGGEST_THRESHOLD
│   │   ├── weights.ts              # Question option weight definitions
│   │   └── signals.ts              # Behavioral update signal handlers
│   ├── extractors/
│   │   ├── pdf.ts                  # pdf.js wrapper
│   │   ├── docx.ts                 # mammoth.js wrapper
│   │   └── normalize.ts            # → NormalizedContent
│   └── firebase/                   # [COULD] Firebase setup
│       ├── client.ts
│       └── db.ts
│
├── hooks/
│   ├── useNeuroPrint.ts            # Vector state + update actions
│   ├── useSession.ts               # Session content + processing state
│   ├── useQuiz.ts                  # Quiz state machine
│   └── useSprint.ts                # Sprint card state + timer
│
├── store/
│   └── context.tsx                 # React Context + useReducer root
│
├── types/
│   └── index.ts                    # All shared TypeScript interfaces
│
├── public/
│   └── fonts/ icons/ etc.
│
├── .env.local                      # GEMINI_API_KEY (never committed)
├── .env.example                    # Template for team setup
├── PRODUCT_DOC.md                  # This file
└── README.md                       # Setup + run instructions
```

---

## 10. MoSCoW Prioritization

### Must Have (MVP — competition submission depends on these)

- [ ] Onboarding flow (6 questions, vector calculation, NeuroPrint card)
- [ ] NeuroPrint vector system (calculation, thresholds, visibility logic)
- [ ] NeuroPrint card (persistent, animated, with override sliders)
- [ ] Upload Desk (text paste, PDF, image, link)
- [ ] Unified Gemini processing pipeline
- [ ] Adaptive Study Surface (layout controlled by vector weights)
- [ ] Podcast Script output + Web Speech API playback
- [ ] Sprint Cards + focus mode + constellation progress
- [ ] Scholar side-by-side + difficulty slider + tooltips
- [ ] Quiz system (universal, rescue cards, invisible difficulty)
- [ ] Session persistence in localStorage

### Should Have (strong submission — include if timeline allows)

- [ ] DOCX upload (mammoth.js — estimated 45 min)
- [ ] Target exam mode (exam upload → concept flagging)
- [ ] Audio file input (Gemini audio transcription)
- [ ] Streak system + milestone toasts (ADHD profile)
- [ ] Concept map (React Flow — estimated 2 hrs)
- [ ] Behavioral adaptive updates to NeuroPrint in real-time

### Could Have (nice-to-have, not blocking)

- [ ] Firebase anonymous auth + Firestore persistence
- [ ] Google Sign-In (merge anon → Google account)
- [ ] Cross-device NeuroPrint sync
- [ ] Sprint timer (opt-in countdown — 30 min to add once card is built)
- [ ] Camera capture (mobile browser file input — nearly free to add)
- [ ] Session summary screen (quiz accuracy, streak, concepts covered)

### Won't Have (pitch material only — mention in video, don't build)

- Multiplayer Study Room / real-time collaboration
- Video upload + audio extraction
- Native mobile app
- Offline / local model mode (RTX 4070 stretch goal)
- Teacher/professor dashboard
- Spaced repetition scheduling

---

## 11. Team Task Breakdown & File Ownership

### 11.1 — Split Philosophy
The development split for Nuro is vertical-by-feature, not horizontal-by-layer. Each developer owns their assigned features from the Gemini prompt logic and API route down to the React hook and final rendered UI component. This ensures both Soroush and Parsa understand the full product stack and prevents either person from being siloed into purely "backend" or "frontend" work. Shared foundation files (types, context, Gemini client) are established during a mandatory joint Phase 0 session to ensure parallel work proceeds without architectural friction.

### 11.2 — Phase 0: Do Together First (estimated 1–1.5 hrs)
This joint session must be completed before any parallel work begins to lock the contracts between features.

1. `types/index.ts` — Define all shared interfaces: `NeuroPrintVector`, `NormalizedContent`, `SprintCard`, `QuizQuestion`, `RescueCard`, `SessionState`, `ProcessedOutput`. (~40 min)
2. `lib/mock.ts` — Create a mock data file with one hardcoded value per type (e.g., `mockNeuroPrint`, `mockSprintCards`). Parsa uses these as drop-in stubs for parallel UI development. (~15 min)
3. `store/context.tsx` — Set up the React Context and useReducer root with the agreed state shape. (~20 min, Soroush drives)
4. `lib/gemini/client.ts` — Initialize the Gemini client configuration. (~10 min, Soroush only)
5. Project init — Run `npx create-next-app`, install dependencies (React Flow, pdf.js, mammoth.js, Tailwind), and push the initial commit with `.env.local` configured. (~15 min, Soroush only)

**After Phase 0, both developers work fully in parallel with zero blocking dependencies until Handoff 1.**

### 11.3 — Feature Ownership by Person

**Soroush owns these features end-to-end:**
- **NeuroPrint Engine + Card**
  - `lib/neuroprint/weights.ts`, `engine.ts`, `thresholds.ts`, `signals.ts`
  - `hooks/useNeuroPrint.ts`
  - `components/neuroprint/NeuroPrintCard.tsx`, `OverrideSliders.tsx`
- **Upload Pipeline + Upload Desk UI**
  - `lib/extractors/pdf.ts`, `docx.ts`, `normalize.ts`
  - `app/api/fetch-link/route.ts`
  - `components/upload/UploadDesk.tsx`, `FileDropZone.tsx`, `LinkInput.tsx`, `SessionLimitBar.tsx`
- **Onboarding Logic + Questions**
  - `lib/neuroprint/weights.ts` (Question weight definitions)
  - `app/onboarding/page.tsx`
  - `components/onboarding/QuestionCard.tsx`, `OptionButton.tsx`, `FreeTextFallback.tsx`, `ProgressDots.tsx`
- **Scholar Feature (prompt → API → UI)**
  - `lib/gemini/prompts/scholar.ts`
  - `app/api/gemini/scholar/route.ts`
  - `hooks/useScholar.ts`
  - `components/study/scholar/SideBySidePanel.tsx`, `DifficultySlider.tsx`, `TermTooltip.tsx`, `ConceptMap.tsx`

**Parsa owns these features end-to-end:**
- **Podcast Feature (prompt → API → UI)**
  - `lib/gemini/prompts/podcast.ts`
  - `app/api/gemini/podcast/route.ts`
  - `hooks/usePodcast.ts`
  - `components/study/podcast/PodcastPanel.tsx`, `ScriptView.tsx`
- **Sprint Feature (prompt → API → UI)**
  - `lib/gemini/prompts/sprint.ts`
  - `app/api/gemini/sprint/route.ts`
  - `hooks/useSprint.ts`
  - `components/study/sprint/SprintCard.tsx`, `ConstellationProgress.tsx`, `StreakCounter.tsx`, `MilestoneToast.tsx`, `SprintTimer.tsx`
- **Quiz Feature (prompt → API → UI)**
  - `lib/gemini/prompts/quiz.ts`
  - `app/api/gemini/quiz/route.ts`
  - `hooks/useQuiz.ts`
  - `components/quiz/QuizCard.tsx`, `RescueCard.tsx`
- **Study Surface + App Shell**
  - `app/page.tsx` (Home/Landing)
  - `app/study/page.tsx`
  - `components/study/StudySurface.tsx`
  - `hooks/useSession.ts`

**Shared files (Coordinate explicitly before editing):**
`types/index.ts`, `store/context.tsx`, `lib/gemini/client.ts`, `lib/mock.ts`, `lib/gemini/models.ts`.

### 11.4 — Build Strategy: Mocks First, Real Data Later
Both developers build their features against the static data in `lib/mock.ts` during Phase 1. Parsa’s components render immediately using mock data without waiting for API completion. Soroush’s API routes are built and validated via Postman independently. Handoff consists of a one-line swap: replacing a mock import with a real hook call or endpoint fetch. This ensures the UI code remains stable while the data source switches from static to live.

### 11.5 — Merge Conflict Prevention Rules
1. **Feature Directory Lock**: You own your designated feature directory. Never edit a file listed under the other person's ownership without prior chat notification.
2. **Coordinated Shared Edits**: Never edit shared files (`types`, `context`, `mock`) silently. Push changes immediately and notify your partner to pull.
3. **Type-First Evolution**: If a type shape must change, both must agree first. One person makes the edit and pushes; the other pulls immediately.
4. **Contract Stability**: API response shapes are locked in Phase 0. If a backend change is required, the corresponding mock must be updated simultaneously.
5. **Commit Frequency**: Commit every sub-task completion. Never hold uncommitted work for more than 30 minutes during active build sessions.

### 11.6 — Handoff Points

**Handoff 1 — NeuroPrint hook goes live**
- **When**: Soroush finishes `useNeuroPrint` hook and it reads from real localStorage-persisted vector
- **Initiator**: Soroush | **Receiver**: Parsa
- **What changes**: In `NeuroPrintCard.tsx`, swap `mockNeuroPrint` for `useNeuroPrint()` hook call. One line.
- **Also**: `StudySurface.tsx` can now read real vector weights for layout calculation
- **Time**: 5 minutes
- **Communication**: "useNeuroPrint is live. Shape: `{ audio, adhd, scholar, manualOverride, lastUpdated }`. Pull and swap."

**Handoff 2 — Processing pipeline goes live**
- **When**: Soroush finishes `/api/gemini/process` (or the individual feature API routes — podcast, sprint, scholar) and confirms clean JSON output via Postman
- **Initiator**: Soroush | **Receiver**: Parsa (for podcast/sprint/quiz routes) and also Parsa's StudySurface
- **What changes**: In `usePodcast.ts`, `useSprint.ts`, and `useQuiz.ts`, swap mock content arrays for real API fetch calls. In `StudySurface.tsx`, swap mock session content for real `useSession` state.
- **Time**: 20–30 minutes (one hook at a time)
- **Communication**: "Podcast API is live at `/api/gemini/podcast`. Response shape matches `mockPodcastScript`. Pull and swap."

**Handoff 3 — Quiz scoring goes live**
- **When**: Parsa finishes `/api/gemini/quiz/route.ts` (Parsa owns quiz end-to-end now)
- **Initiator**: Parsa | **Receiver**: Parsa (Internal Handoff)
- **What changes**: Parsa swaps `useQuiz.ts` from mock answer evaluation to real Gemini Flash scoring.
- **Time**: 10 minutes
- **Communication**: No cross-person coordination needed. Parsa handles it entirely.

### 11.7 — Suggested Timeline

```
Hour 0–1.5   → BOTH: Phase 0
               types/index.ts + lib/mock.ts + store/context.tsx + project init

Hour 1.5–7   → FULL PARALLEL
               Soroush: NeuroPrint engine → onboarding logic → upload pipeline → scholar feature
               Parsa:   Study surface shell → podcast feature → sprint feature → quiz feature
               (both build against mock data, no coordination needed)

Hour 7       → HANDOFF 1 (5 min)
               Soroush: push useNeuroPrint hook
               Parsa: swap NeuroPrintCard + StudySurface to live vector

Hour 7–10    → CONTINUE PARALLEL
               Soroush: finish scholar API + upload API routes, test via Postman
               Parsa:   wire podcast/sprint/quiz hooks to real APIs as Soroush ships them

Hour 10      → HANDOFF 2 (20–30 min)
               Soroush confirms all API routes clean
               Parsa swaps remaining mocks in usePodcast, useSprint, useSession

Hour 10–11   → BOTH: Integration QA
               Test full user flow end to end, fix broken seams, polish

Hour 11–12   → BOTH: Demo video recording + README
```

---

## 12. Comprehensive Task Table

> **Legend:** U0 = blocking / do first · U1 = high value · U2 = nice to have
> **MVP:** ✅ Yes · 🟡 Should · ⬜ Could · ❌ Pitch only

| Feature | Epic | Task | Layer | Priority | MVP | Owner | Phase | Blocked by | Est. time | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Setup | Repo | Init Next.js 14 + Tailwind + TypeScript | foundation | U0 | ✅ | Soroush | P0-setup | nothing | 15 min | ✅ |
| Setup | Repo | Define shared interfaces in `types/index.ts` | foundation | U0 | ✅ | Both | P0-setup | nothing | 40 min | ✅ |
| Setup | Repo | Create mock data file `lib/mock.ts` | foundation | U0 | ✅ | Both | P0-setup | types/index.ts | 15 min | ✅ |
| Setup | Repo | Set up `store/context.tsx` with useReducer | foundation | U0 | ✅ | Both | P0-setup | types/index.ts | 20 min | ⬜ |
| Setup | Repo | Set up Gemini API client in `lib/gemini/client.ts` | foundation | U0 | ✅ | Soroush | P0-setup | nothing | 10 min | ⬜ |
| Setup | Repo | Define model name constants in `lib/gemini/models.ts` | foundation | U0 | ✅ | Soroush | P0-setup | nothing | 10 min | ⬜ |
| Setup | Repo | Install React Flow, pdf.js, mammoth.js | foundation | U0 | ✅ | Soroush | P0-setup | nothing | 10 min | ✅ |
| NeuroPrint | Engine | Write question weight definitions (`weights.ts`) | engine | U0 | ✅ | Soroush | P1-parallel | types/index.ts | 30 min | ⬜ |
| NeuroPrint | Engine | Implement vector calculation + normalization | engine | U0 | ✅ | Soroush | P1-parallel | weights.ts | 45 min | ⬜ |
| NeuroPrint | Engine | Define threshold constants (`thresholds.ts`) | engine | U0 | ✅ | Soroush | P1-parallel | nothing | 15 min | ⬜ |
| NeuroPrint | Engine | Implement feature visibility resolver | engine | U0 | ✅ | Soroush | P1-parallel | thresholds.ts | 30 min | ⬜ |
| NeuroPrint | Engine | `useNeuroPrint` hook (localStorage read/write) | hook | U0 | ✅ | Soroush | P1-parallel | vector logic | 45 min | ⬜ |
| NeuroPrint | UI | `NeuroPrintCard` component (animated bars) | component | U0 | ✅ | Soroush | P1-parallel | lib/mock.ts | 60 min | ⬜ |
| NeuroPrint | UI | `OverrideSliders` panel | component | U1 | 🟡 | Soroush | P1-parallel | NeuroPrintCard | 45 min | ⬜ |
| NeuroPrint | Adaptive | Behavioral signal handler (`signals.ts`) | engine | U1 | 🟡 | Soroush | P1-parallel | vector logic | 60 min | ⬜ |
| NeuroPrint | Adaptive | Debounce logic for adaptive updates | engine | U1 | 🟡 | Soroush | P1-parallel | signals.ts | 30 min | ⬜ |
| Onboarding | Logic | Write 6 questions + options + weights | engine | U0 | ✅ | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Onboarding | UI | `QuestionCard` (options + fallback) | component | U0 | ✅ | Soroush | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Onboarding | UI | `OptionButton` component (selected state) | component | U0 | ✅ | Soroush | P1-parallel | nothing | 20 min | ⬜ |
| Onboarding | UI | `FreeTextFallback` input component | component | U0 | ✅ | Soroush | P1-parallel | nothing | 20 min | ⬜ |
| Onboarding | UI | 6-dot progress indicator | component | U0 | ✅ | Soroush | P1-parallel | nothing | 20 min | ⬜ |
| Onboarding | UI | Onboarding page flow & reveal logic | component | U0 | ✅ | Soroush | P1-parallel | QuestionCard | 60 min | ⬜ |
| Onboarding | UI | NeuroPrint card animate-in on completion | component | U0 | ✅ | Soroush | P1-parallel | Onboarding page | 30 min | ⬜ |
| Upload | Pipeline | pdf.js wrapper (`lib/extractors/pdf.ts`) | engine | U0 | ✅ | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Upload | Pipeline | mammoth.js wrapper (`lib/extractors/docx.ts`) | engine | U1 | 🟡 | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Upload | Pipeline | Normalize types to `NormalizedContent` | engine | U0 | ✅ | Soroush | P1-parallel | extractors | 30 min | ⬜ |
| Upload | API | Link fetcher API route (`/api/fetch-link`) | api | U0 | ✅ | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Upload | API | Audio transcription API route | api | U1 | 🟡 | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Upload | UI | `UploadDesk` layout component | component | U0 | ✅ | Soroush | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Upload | UI | Drag-and-drop `FileDropZone` | component | U0 | ✅ | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Upload | UI | Per-file confirmation UI (size/icon) | component | U0 | ✅ | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Upload | UI | `SessionLimitBar` (100MB tracker) | component | U0 | ✅ | Soroush | P1-parallel | nothing | 20 min | ⬜ |
| Upload | UI | `LinkInput` component | component | U0 | ✅ | Soroush | P1-parallel | nothing | 20 min | ⬜ |
| Upload | UI | Target exam upload tag integration | component | U1 | 🟡 | Soroush | P1-parallel | UploadDesk | 30 min | ⬜ |
| Upload | UI | `QuickNote` field (text + voice) | component | U1 | 🟡 | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Study Surface | Shell | Home/landing page (`app/page.tsx`) | component | U0 | ✅ | Parsa | P1-parallel | nothing | 60 min | ⬜ |
| Study Surface | Shell | Study page setup (`app/study/page.tsx`) | component | U0 | ✅ | Parsa | P1-parallel | nothing | 45 min | ⬜ |
| Study Surface | Shell | `StudySurface` adaptive layout controller | component | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 90 min | ⬜ |
| Study Surface | Shell | Panel width calculation logic | engine | U0 | ✅ | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Study Surface | Shell | `hooks/useSession.ts` (content/loading state) | hook | U0 | ✅ | Parsa | P1-parallel | types/index.ts | 45 min | ⬜ |
| Study Surface | UI | Processing loading state animation | component | U0 | ✅ | Parsa | P1-parallel | nothing | 45 min | ⬜ |
| Study Surface | UI | Suggestion chip rendering logic | component | U1 | 🟡 | Parsa | P1-parallel | StudySurface | 30 min | ⬜ |
| Podcast | Pipeline | Podcast script prompt (`prompts/podcast.ts`) | prompt | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Podcast | API | Podcast API route (`/api/gemini/podcast`) | api | U0 | ✅ | Parsa | P1-parallel | prompt | 30 min | ⬜ |
| Podcast | Hook | `hooks/usePodcast.ts` (playback state) | hook | U0 | ✅ | Parsa | P1-parallel | types/index.ts | 45 min | ⬜ |
| Podcast | UI | `PodcastPanel` (script + controls) | component | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 60 min | ⬜ |
| Podcast | UI | `ScriptView` (readable text) | component | U0 | ✅ | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Podcast | UI | Web Speech API dual-voice implementation | engine | U0 | ✅ | Parsa | P1-parallel | nothing | 60 min | ⬜ |
| Sprint | Pipeline | Content chunking prompt (`prompts/sprint.ts`) | prompt | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Sprint | API | Sprint API route (`/api/gemini/sprint`) | api | U0 | ✅ | Parsa | P1-parallel | prompt | 30 min | ⬜ |
| Sprint | Hook | `hooks/useSprint.ts` (card navigation) | hook | U0 | ✅ | Parsa | P1-parallel | types/index.ts | 45 min | ⬜ |
| Sprint | UI | `SprintCard` focus mode component | component | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 60 min | ⬜ |
| Sprint | UI | `ConstellationProgress` component | component | U0 | ✅ | Parsa | P1-parallel | nothing | 60 min | ⬜ |
| Sprint | UI | `StreakCounter` component | component | U0 | ✅ | Parsa | P1-parallel | nothing | 20 min | ⬜ |
| Sprint | UI | `MilestoneToast` component | component | U1 | 🟡 | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Sprint | UI | `SprintTimer` opt-in component | component | U1 | ⬜ | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Scholar | Pipeline | Side-by-side simplification prompt | prompt | U0 | ✅ | Soroush | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Scholar | Pipeline | Tooltip generation prompt | prompt | U0 | ✅ | Soroush | P1-parallel | nothing | 30 min | 0 |
| Scholar | API | Scholar API route (`/api/gemini/scholar`) | api | U0 | ✅ | Soroush | P1-parallel | prompt | 30 min | ⬜ |
| Scholar | Hook | `hooks/useScholar.ts` (slider/tooltip state) | hook | U0 | ✅ | Soroush | P1-parallel | types/index.ts | 45 min | ⬜ |
| Scholar | UI | `SideBySidePanel` layout component | component | U0 | ✅ | Soroush | P1-parallel | lib/mock.ts | 60 min | ⬜ |
| Scholar | UI | Amber underline for key terms | component | U0 | ✅ | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Scholar | UI | `TermTooltip` (def + exam note) | component | U0 | ✅ | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Scholar | UI | `DifficultySlider` + vector signal logic | component | U0 | ✅ | Soroush | P1-parallel | nothing | 45 min | ⬜ |
| Scholar | UI | `ConceptMap` React Flow component | component | U1 | 🟡 | Soroush | P1-parallel | nothing | 2 hrs | ⬜ |
| Gemini Core | Pipeline | Main content processing prompt builder | prompt | U0 | ✅ | Soroush | P1-parallel | nothing | 60 min | ⬜ |
| Gemini Core | Pipeline | NeuroPrint vector injection logic | engine | U0 | ✅ | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Gemini Core | Pipeline | Target concept extraction prompt | prompt | U1 | 🟡 | Soroush | P1-parallel | nothing | 30 min | ⬜ |
| Gemini Core | API | Main processing API (`/api/gemini/process`) | api | U0 | ✅ | Soroush | P1-parallel | extractors | 45 min | ⬜ |
| Quiz | Pipeline | Quiz generation prompt (profile-tuned) | prompt | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 45 min | ⬜ |
| Quiz | Pipeline | Answer evaluation prompt (Gemini Flash) | prompt | U0 | ✅ | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Quiz | Pipeline | Rescue card generation prompt | prompt | U0 | ✅ | Parsa | P1-parallel | nothing | 30 min | ⬜ |
| Quiz | API | Quiz API route (`/api/gemini/quiz`) | api | U0 | ✅ | Parsa | P1-parallel | prompt | 30 min | ⬜ |
| Quiz | Hook | `hooks/useQuiz.ts` (difficulty state machine) | hook | U0 | ✅ | Parsa | P1-parallel | types/index.ts | 60 min | ⬜ |
| Quiz | UI | `QuizCard` component | component | U0 | ✅ | Parsa | P1-parallel | lib/mock.ts | 60 min | ⬜ |
| Quiz | UI | `RescueCard` component | component | U0 | ✅ | Parsa | P1-parallel | nothing | 45 min | ⬜ |
| Integration | Handoff | Handoff 1: Swap NeuroPrint mock for hook | integration | U0 | ✅ | Both | P2-handoff | useNeuroPrint | 10 min | ⬜ |
| Integration | Handoff | Handoff 2: Swap Pipeline mocks for APIs | integration | U0 | ✅ | Both | P2-handoff | all API routes | 30 min | ⬜ |
| Integration | Handoff | Handoff 3: Real Quiz scoring scoring | integration | U0 | ✅ | Parsa | P2-handoff | quiz API | 10 min | ⬜ |
| Integration | Polish | Session summary screen (results/streak) | component | U1 | ⬜ | Parsa | P2-handoff | useSession | 60 min | ⬜ |
| Integration | QA | Full end-to-end user flow testing | integration | U0 | ✅ | Both | P3-polish | all handoffs | 60 min | ⬜ |
| Demo | Deliver | Write demo script & storyboard | demo | U0 | ✅ | Both | P3-polish | nothing | 45 min | ⬜ |
| Demo | Deliver | Screen recording & editing (4 min) | demo | U0 | ✅ | Both | P3-polish | QA | 60 min | ⬜ |
| Demo | Deliver | README & Final Repo submission | demo | U0 | ✅ | Soroush | P3-polish | nothing | 30 min | ⬜ |

---

## 13. Teach Me Mode — Decision Record

### What it is

Teach Me mode is a Socratic AI tutor — a one-on-one conversation between the student and an AI that teaches by asking, not by telling. The student uploads or selects processed material and the AI enters dialogue, responding to their answers with deeper questions rather than explanations.

The live concept map (React Flow, JSON from Gemini) updates as the conversation progresses: nodes turn green when a concept is demonstrated, red when answered wrong, grey when untouched. The tutor's voice and question style are shaped by the NeuroPrint vector.

### Why it's not in the task table yet

Teach Me mode is architecturally sound and will be impressive in the final product, but it is not required for the MVP submission. Breaking it into granular tasks now would add scope anxiety during a 12-hour build. It will be added as a second pass once the core three-profile study surface is shipped and stable.

### What it needs (high level, for later breakdown)

- Socratic tutor system prompt (NeuroPrint-tuned personality + questioning style)
- Chat loop UI (simple — user input → Gemini → response)
- Concept map JSON extraction from tutor conversation
- React Flow component (shared with Scholar if that ships first)
- Node state management: untouched / demonstrated / wrong

### Pitch framing

In the demo video, Teach Me is framed as "what this becomes" — shown briefly as a working prototype, positioned as the depth layer beneath the study surface. Even a minimal working version (chat loop + basic concept map) will impress.

---

## 14. Decision Log

| # | Decision | Rationale | Date |
|---|---|---|---|
| 1 | Web app over CLI or mobile | Browser demo is visual, Next.js splits work cleanly, polished on screen | Mar 24 |
| 2 | Next.js + Tailwind as stack | Fast to ship, both devs can work in it, Vercel deploy is trivial | Mar 24 |
| 3 | Gemini 2.5 Pro as primary model | GDG judges are Google-affiliated; native multimodal saves preprocessing; 1M context | Mar 24 |
| 4 | Gemini 2.5 Flash for fast calls | Low latency + low cost for "reflex" operations (quiz scoring, profile updates) | Mar 24 |
| 5 | No dedicated backend | All Gemini calls through Next.js API routes; no server to deploy or debug | Mar 24 |
| 6 | NeuroPrint as float vector, not discrete modes | Users are blends, not archetypes; enables elegant multi-profile UX | Mar 24 |
| 7 | Behavior-proxy questions, not direct "how do you learn?" | Direct questions require self-awareness users don't have; proxies are more accurate | Mar 24 |
| 8 | Explicit self-ID question weighted 2-3× higher than proxy questions | User self-report is strong signal; should dominate when present | Mar 24 |
| 9 | Feature visibility thresholds: 0.55 show / 0.25 suggest / <0.25 hide | Keeps UI simple; avoids overwhelming blended-profile users with every feature | Mar 24 |
| 10 | Constellation progress, not a progress bar | Progress bar shows "how much is left" (demotivating for ADHD); constellation shows "what I've built" | Mar 24 |
| 11 | Sprint timer opt-in, framed as power-up | Default-on timer feels like deadline pressure; opt-in makes it feel like a feature | Mar 24 |
| 12 | Rescue cards never use word "wrong/incorrect" | Language of failure kills motivation; reframe as alternative approach | Mar 24 |
| 13 | Quiz difficulty fully invisible to user | Showing difficulty level tanks motivation; user just experiences appropriate questions | Mar 24 |
| 14 | Firebase is Could, not Must | Adds value but localStorage is sufficient for demo; auth adds 30-45 min risk | Mar 24 |
| 15 | Teach Me mode: brief decision record, no task breakdown yet | Core three profiles must ship first; Teach Me breakdown added in second pass | Mar 24 |
| 16 | Vertical feature split ownership model | Prevents siloing; ensures both developers understand full stack of owned features | Mar 24 |
| 17 | Local model is stretch goal / pitch material only | RTX 4070 8GB insufficient for quality 70B+ models; Gemini API is more reliable | Mar 24 |
| 18 | DOCX via mammoth.js (client-side) | Zero backend needed; 45-min implementation; extracted text + images sent to Gemini normally | Mar 24 |

---

## 15. Changelog

| Date | Author | Change |
|---|---|---|
| Mar 24, 2026 | Soroush | Initial document created from brainstorm session |

---

*This document is the single source of truth for the Nuro build. Update the Changelog and Decision Log as decisions are made or changed during the build.*