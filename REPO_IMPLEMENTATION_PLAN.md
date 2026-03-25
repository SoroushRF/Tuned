# REPO Implementation Plan (Task-by-Task)

This plan translates your “check this repo / find holes and problems” + the follow-up numbered requirements into concrete, sequenced implementation tasks.

## Scope Map (what this repo looks like)
- Next.js app lives under `Tuned/`.
- Backend endpoints live under `Tuned/src/app/api/**`.
- Client UI components live under `Tuned/src/components/**` and hooks under `Tuned/src/hooks/**`.

## Milestones (high level)
1. **Security + Build unblock**: remove URL fetch (SSRF), fix lint/build blockers, gate debug logs safely, and add Gemini polling timeouts.
2. **Functional upload improvements**: ensure image/audio uploads actually reach Gemini with validation (“tighten”), and remove link fetching entirely.
3. **UX + UI upgrades**: dark mode removal, landing page layout/font, onboarding dots bug, scholar focus mode removal, podcast transcript toggle, sprint UX clarity, scholar definition cards-on-click, and general UI decluttering.

---

## Task Status (current)
- Task 1: Not done
- Task 2: Not done
- Task 3: Not done
- Task 4: Not done
- Task 5: Not done
- Task 6: Not done
- Task 7: Not done
- Task 8: Done
- Task 9: Not done
- Task 10: Not done
- Task 11: Not done
- Task 12: Done
- Task 13: Not done
- Task 14: Not done
- Task 15: Not done
- Task 16: Not done
- Task 17: Not done
- Task 18: Not done
- Task 19: Not done
- Task 20: Not done
- Task 21: Not done
- Task 22: Not done
- Task 23: Not done

---

## Task 1: Identify build/lint blockers (baseline)
### 1.1 Capture exact current failures
- Record `npm run lint` / `npm run build` output and list each file + rule.

### 1.2 Fix categories (what’s failing and why)
1. `@typescript-eslint/no-explicit-any` errors (hard build stop)
   - `src/app/api/gemini/analyze-onboarding/route.ts`
   - `src/app/api/gemini/podcast/audio/route.ts`
   - `src/app/api/gemini/process/route.ts`
   - `src/components/Upload/UploadDesk.tsx`
   - `src/hooks/usePodcast.ts`
2. `@typescript-eslint/no-unused-vars` errors (hard build stop)
   - `src/components/onboarding/OptionButton.tsx`
   - `src/components/onboarding/QuestionCard.tsx`
   - `src/components/Profile/NeuroPrintProfile.tsx`
   - `src/components/Upload/UploadDesk.tsx`
   - `src/hooks/usePodcast.ts`
   - `src/hooks/useQuiz.ts`
   - `src/store/context.tsx`
3. `react-hooks/exhaustive-deps` warnings (may cause stale behavior even if not fatal)
   - `src/components/onboarding/OnboardingFlow.tsx`
   - `src/components/StudySurface/SprintPanel.tsx`
   - `src/hooks/usePodcast.ts`
   - `src/hooks/useSprint.ts`
   - `src/hooks/usePodcast.ts` (useEffect dependency warning)

**Acceptance criteria**
- `npm run build` passes.
- ESLint has no `error` severity violations.

---

## Task 2: Remove the whole URL fetch thing (UI + backend)
### 2.1 Backend removal
1. Delete `Tuned/src/app/api/fetch-url/route.ts`.
2. Remove any remaining references to `/api/fetch-url` (search for `fetch-url` in the repo).

### 2.2 UI removal
1. Update `Tuned/src/components/Upload/UploadDesk.tsx`:
   - Remove `type: 'link'` from `UploadItem`.
   - Remove link UI input + button.
   - Remove `addLink` function.
   - Update `processAll()` to stop including link items (since link fetching is gone).

### 2.3 Cleanup of related state/limits
1. Remove link limits (`TYPE_LIMITS.link`) and any UI counters that refer to links.

**Acceptance criteria**
- No `/api/fetch-url` route exists.
- No UI path allows user to submit an external URL.
- Upload flow still works for PDFs/docx/text/images/audio (as implemented in later tasks).

---

## Task 3: Keep debug/dev logging, but make it safe in production
### 3.1 Audit logging
1. Find where you log entire user content / raw AI responses.
2. Ensure these logs are gated behind your debug flags (not unconditional `console.log`).

### 3.2 Implement gating rules
- Keep verbose logging only when `GEMINI_DEBUG` / `NEXT_PUBLIC_GEMINI_DEBUG` enables it.
- In production, log only request IDs and minimal metadata (lengths, status, elapsed ms).

**Acceptance criteria**
- Debug mode still prints raw responses you need.
- Production build does not print raw response bodies unconditionally.

---

## Task 4: Tighten image + audio uploads to Gemini (and make them actually used)
> You currently accept images/audio in the UI, but the “process pipeline” only uploads PDFs. This task fixes both validation and wiring.

### 4.1 Investigate intended behavior
1. Locate where images/audio are extracted in `UploadDesk`.
2. Locate how `transformContentWithPdf()` and `/api/gemini/process` are expecting files.
3. Decide what should happen for:
   - `image`: include image(s) as Gemini inputs (likely as file parts).
   - `audio`: either (a) upload to Gemini as context and ask for transcription/summary, or (b) reject with a clear error and suggest “text transcript required”.

### 4.2 Tighten file validation (client + server)
On the client (`UploadDesk`), enforce:
1. Only allow known extensions and MIME types.
2. Enforce stricter size caps for images and audio.
3. Enforce maximum counts.

On the server (`process` and any new routes you add):
1. Re-validate file types and sizes (never trust client validation).
2. Reject unsupported file types with `400`.

### 4.3 Wire images/audio into Gemini processing
1. Update `transformContentWithPdf()` naming or implementation:
   - It currently only appends PDFs, but you should append images/audio too.
2. Update `Tuned/src/app/api/gemini/process/route.ts`:
   - Extend multipart parsing to collect `images` and `audio` parts (or reuse a consistent `pdfs/images/audios` field naming).
   - Upload those files via Gemini SDK and include them in `generateContent` inputs.
3. Update prompts/instructions to handle image/audio context properly.

### 4.4 Add robust response parsing + shape normalization
1. Ensure the returned `ProcessedOutput` always matches the TypeScript interface.
2. Add fallback handling for missing sections (but avoid empty arrays if your prompt forbids it).

**Acceptance criteria**
- Uploading images/audio no longer silently does nothing.
- Gemini processing rejects invalid file types/counts reliably.
- End-to-end: Upload -> Submit -> `currentSession` is populated and UI renders.

---

## Task 5: Fix Gemini timeouts + add high limits safely
### 5.1 Identify hang points
1. In `src/app/api/gemini/process/route.ts`, find the `while (fileRecord.state !== "ACTIVE" ...)` loops.
2. Repeat for other Gemini routes that poll file state (if any).

### 5.2 Add polling timeout/deadline
1. Add constants:
   - `MAX_UPLOAD_POLL_MS` (high, since “what we are doing takes long”)
   - `POLL_INTERVAL_MS`
2. Convert polling loop to:
   - stop after `deadline` and throw a clear error: “Gemini file processing timed out”.

### 5.3 Add request-level timeouts
1. Wrap `ai.models.generateContent(...)` with an `AbortSignal.timeout(...)` (with high ms).
2. Make sure errors are handled with clear messages for the UI.

**Acceptance criteria**
- No request hangs forever.
- Timeouts are high enough to support your current workflow.
- UI shows a meaningful error when Gemini is too slow.

---

## Task 6: Fix React Hook dependencies (stale state bugs)
### 6.1 Resolve lint warnings
1. `src/components/onboarding/OnboardingFlow.tsx`: fix missing dependency for `handleNext`.
2. `src/components/StudySurface/SprintPanel.tsx`: fix missing dependencies for `handleResetClue` and `handleTimerToggle`.
3. `src/hooks/usePodcast.ts`: fix:
   - `useMemo` missing dependency (`script`).
   - `useEffect` missing dependency (`sentenceTimeline`).
4. `src/hooks/useSprint.ts`: resolve missing dependency warnings for callbacks.

### 6.2 Prefer correct fix patterns
- Use `useCallback` to stabilize function references, then include them in dependency arrays.
- Avoid “disable lint”; fix root causes.

**Acceptance criteria**
- `npm run lint` has no hook dependency warnings.
- No behavior regressions when stepping onboarding, scrubbing podcast, or running sprint timer.

---

## Task 7: Fix lint “unused vars” and “explicit any” (build must pass)
### 7.1 Remove unused vars
Fix these flagged items by either:
- Deleting unused variables/imports, or
- Using them meaningfully, or
- Narrowing types so the variable is not needed.
Files:
1. `src/components/onboarding/OptionButton.tsx` (`isMultiSelect` unused)
2. `src/components/onboarding/QuestionCard.tsx` (`cn` unused)
3. `src/components/Profile/NeuroPrintProfile.tsx` (`initialVector` unused)
4. `src/components/Upload/UploadDesk.tsx` (unused `err`)
5. `src/hooks/usePodcast.ts` (`buildSentenceBoundaries`, `findSegmentIndex` unused)
6. `src/hooks/useQuiz.ts` (`failedQuestions` unused)
7. `src/store/context.tsx` (`mockADHDLearner` unused)

### 7.2 Replace `any` with safe types
Replace `any` occurrences with:
- `unknown` + runtime type checks, or
- specific error shapes (`{ message?: string }`), or
- specific request payload types.
Files:
1. `src/app/api/gemini/analyze-onboarding/route.ts`
2. `src/app/api/gemini/podcast/audio/route.ts`
3. `src/app/api/gemini/process/route.ts`
4. `src/components/Upload/UploadDesk.tsx`
5. `src/hooks/usePodcast.ts`

**Acceptance criteria**
- `npm run build` passes.
- No ESLint errors remain.

---

## Task 8: Kill dark mode functionally and remove toggle
### 8.1 Remove the toggle UI
1. Remove the dark-mode button(s) from:
   - landing page navbar (`src/app/page.tsx`)
   - study page header (`src/app/study/page.tsx`)

### 8.2 Remove state + side effects
1. Update `src/store/context.tsx`:
   - Remove `theme` from `AppState`.
   - Remove theme toggling actions (`SET_THEME`).
   - Remove the `useEffect` that adds/removes `dark` class on `documentElement`.

### 8.3 Ensure styling is consistent
1. Ensure “dark” class usage doesn’t break layout.
2. Remove `dark:` Tailwind variants if needed, or accept them as “unused”.

**Acceptance criteria**
- There is no UI control to toggle dark mode.
- App always renders in the light theme.

---

## Task 9: Ensure “Tuned” project name is used everywhere (navbars + headers)
### 9.1 Find mismatches
- Identify any “Nuro” or other branding that differs.

### 9.2 Replace consistently
1. Update landing page branding already says “Tuned”.
2. Update study page header branding:
   - currently it displays `Nuro`.
3. Search repo for `Nuro` / other mismatched brand strings and replace with `Tuned`.

**Acceptance criteria**
- All navbars/headers consistently show “Tuned”.

---

## Task 10: Onboarding dots bug (Q4 -> click Q1 should jump to Q1)
### 10.1 Investigate `ProgressDots` behavior
1. Locate `Tuned/src/components/onboarding/ProgressDots.tsx`.
2. Inspect how it computes “filled” dots (does it use `maxStepReached`? does it ignore `history`?).

### 10.2 Fix step-jump logic end-to-end
1. Ensure clicking a dot sets `currentStep` to the clicked index exactly.
2. Ensure filled/answered dots reflect `history` (not a derived “current progress” that can only move forward/back by 1).

### 10.3 Add a regression check
- Reproduce scenario:
  - user progresses to Q4
  - clicks Q1 dot
  - verify filled dots match Q1-based view state.

**Acceptance criteria**
- Clicking any dot navigates exactly to that dot.
- Filled dots do not “snap back” by only one item.

---

## Task 11: Scholar page: kill “focus mode” if it only resizes windows
### 11.1 Investigate focus mode behavior
1. Identify where focus mode is implemented:
   - likely `useScholar` (`viewMode: 'split' | 'focus'`) + UI in `ScholarPanel`.
2. Confirm whether focus mode does anything besides resizing.

### 11.2 Implement removal
1. Remove focus mode toggle and state.
2. Render scholar UI in split mode always.

**Acceptance criteria**
- There is no focus-mode toggle/action.
- Scholar page always shows the intended “split” reading experience.

---

## Task 12: Landing page layout changes (horizontal + left aligned)
### 12.1 Update layout structure
1. Modify `src/app/page.tsx`:
   - change hero sections from vertical stacking to side-by-side layout.
   - align items left (instead of center).

### 12.2 Add serif font for one element
1. Pick the best-fitting element (e.g., the “Study smarter…” line or a key tagline).
2. Apply a classy serif font using Tailwind (or a font import if needed).

**Acceptance criteria**
- Landing page reads horizontally (not top-to-bottom centered).
- One key element uses a serif font consistent with your aesthetic.

---

## Task 13: Podcast mode redesign (player left, transcript right + toggle)
### 13.1 Locate podcast UI
1. Find the podcast player/transcript UI:
   - likely `src/components/StudySurface/PodcastPanel.tsx`
   - and/or other subcomponents.

### 13.2 Add “Show/Hide Transcript” option
1. Add a dropdown or toggle to hide transcript.
2. Ensure scrubbing and audio-sentence linkage still work:
   - the `usePodcast` hook logic should keep running regardless of transcript visibility.

### 13.3 Preserve current linkage logic
1. Avoid unmounting the timeline/sentence mapping logic.
2. Prefer hiding via CSS (`display: none` / `hidden` / conditional render but keep timeline state intact).

**Acceptance criteria**
- Player remains fully functional when transcript is hidden.
- Scrubbing updates highlight/indices correctly.

---

## Task 14: Profile modal values alignment to actual app modes
### 14.1 Fix labeling semantics
1. In `src/components/Profile/NeuroPrintProfile.tsx`, adjust the 3 sliders/labels so the text matches the actual 3 modes:
   - `audio` -> “Podcast Mode” (or “Audio Mode”)
   - `adhd` -> “Sprint Mode”
   - `scholar` -> “Scholar Mode”

### 14.2 Ensure 0-100 scale reads correctly
1. Confirm conversion from 0..1 -> 0..100.
2. Ensure displayed text matches what the slider does.

**Acceptance criteria**
- The 3 labels match the app’s mode names, not generic wording.

---

## Task 15: Upload submit button loading animation (not just grey)
### 15.1 Identify submit button state logic
1. In `src/components/Upload/UploadDesk.tsx`, locate the “Process Matrix” button.
2. Determine why it greys out while loading (probably disabled state + spinner).

### 15.2 Add subtle loading animation
1. Keep button enabled/disabled appropriately, but add:
   - a small spinner
   - or a subtle progress shimmer
   - or animated “dots” inside the button

**Acceptance criteria**
- On submit, there is a subtle animation indicating progress.
- Layout does not jump.

---

## Task 16: Sprint mode logic clarity (what user actually clicks)
### 16.1 Investigate current UX flow
1. Trace `SprintPanel` UI actions + `useSprint` state transitions:
   - when “Complete” increments progress
   - when challenge appears
   - when rescue appears
2. Confirm what the user is expected to do in ADHD/sprint mode.

### 16.2 Fix the UX contract
Possible improvements (choose one after investigation):
1. Rename buttons based on stage:
   - Focus: “Complete Clue”
   - Challenge: “I understand”
2. Add a single clear instruction line above the clue/challenge explaining what “Complete” means.
3. Ensure keyboard shortcuts map to correct stage (Enter/Space, Escape, R).

**Acceptance criteria**
- User can understand what to do without reading code.
- “Complete” button behavior matches what you expect for ADHD/sprint.

---

## Task 17: UI declutter in Sprint (ADHD) + Scholar (reduce fluff)
### 17.1 Inventory “fluff”
1. Review `SprintPanel.tsx` and `ScholarPanel` UI for redundant text/labels.

### 17.2 Remove while preserving architecture
1. Keep the same layout architecture, but:
   - remove redundant headers
   - reduce repeated labels
   - tighten spacing
   - emphasize the actual content (title/challenge/meaning)

**Acceptance criteria**
- Screens look less busy but layout sections remain consistent with current architecture.

---

## Task 18: Scholar mode hard-word definitions -> click to show floating cards on the word
### 18.1 Find current highlight + definition behavior
1. Locate where “hard words” in original text are highlighted.
2. Identify why definitions appear at bottom currently.

### 18.2 Implement word-level interaction
1. Make each highlighted hard word clickable (and ideally hoverable).
2. When clicked:
   - find the matching definition
   - render a small definition card
3. Position card:
   - hover card near the word
   - likely with `position: absolute` anchored to the word element

### 18.3 Data flow
1. Use existing `useScholar` logic to identify active term (`activeTerm`).
2. Convert “bottom definitions list” into a “term detail popover”.

### 18.4 Accessibility
- Ensure keyboard interaction works (focus + Enter to open card).
- Ensure click outside closes.

**Acceptance criteria**
- Clicking a highlighted hard word shows a definition card near that word (not at the bottom).
- Definition shown matches the clicked word.

---

## Task 19: Validation / regression checklist (after all changes)
1. `npm run lint` passes.
2. `npm run build` passes.
3. Onboarding:
   - dot click jump works (Q4 -> Q1 -> exactly Q1)
4. Upload flow:
   - PDF works
   - image/audio works (after your Gemini tightening decisions)
   - link fetching is removed
5. Study page:
   - dark mode is gone
   - “Tuned” branding consistent
6. Podcast:
   - scrubbing works with transcript hidden/shown
7. Scholar:
   - focus mode removed
   - definition cards appear on word click
8. Sprint:
   - user understands what “Complete” does
9. Gemini timeouts:
   - requests fail gracefully when too slow, no endless hangs

---

## Task 20: Onboarding option UI cleanup (remove subtexts + center text)
### 20.1 Remove subtexts
1. Locate onboarding option rendering in `Tuned/src/components/onboarding/OptionButton.tsx`.
2. Remove the decorative subtext elements:
   - “Select Alignment”
   - “Calibrated”
3. Ensure selection state visuals remain (indicator/shimmer), but without those two text lines.

### 20.2 Vertically center the option label inside each option box
1. In `OptionButton.tsx`, adjust flexbox alignment so the label block is vertically centered.
2. Keep the horizontal alignment left-aligned (the current behavior you like).

**Acceptance criteria**
- No “Select Alignment” / “Calibrated” subtext appears anywhere in onboarding options.
- The option label text is vertically centered within its button.

---

## Task 21: Rename `/study` into an upload/dashboard flow + add “load responses” endpoint/page transition
> Goal: stop using `/study` as the home for upload/dashboard UI, and add a dedicated endpoint + redirect after uploads finish processing.

### 21.1 Rename the “study” route usage
1. Find where the app navigates to `/study` (likely in `Tuned/src/components/Upload/UploadDesk.tsx`).
2. Replace that navigation with a more upload/dashboard-related URL (example: `/dashboard`).
3. Update any internal links referencing `/study`.

### 21.2 Move the current study page implementation
1. Rename `Tuned/src/app/study/page.tsx` -> `Tuned/src/app/dashboard/page.tsx` (or your chosen name).
2. Confirm imports remain correct.

### 21.3 Add a new endpoint + page transition after uploads are processed
1. Create `Tuned/src/app/api/load-responses/route.ts`.
2. Decide the input contract:
   - Ideally pass a `sessionId` returned from the uploads processing endpoint,
   - then load/hydrate the dashboard payload from that session.
3. Create a loading page (example: `Tuned/src/app/upload-loading/page.tsx`) that:
   - shows the “loading uploaded material” animation
   - calls `POST /api/load-responses`
   - redirects to `/dashboard` once ready.

**Acceptance criteria**
- `/study` no longer appears in URLs.
- After the upload submit, the app goes to a new loading step and then to the new dashboard URL.

---

## Task 22: Add Quiz mode (`/quiz`) powered by Gemini + configuration modal
### 22.1 Quiz entrypoint (after finishing study)
1. Detect when all 3 study panels are “done” (whatever your existing completion logic is in LayoutController/StudySurface).
2. Show a UI that offers:
   - “Start Quiz”
   - “Exit”

### 22.2 Quiz configuration modal
1. When “Start Quiz” is clicked, open a modal that asks for:
   - level
   - question difficulty (or mapping)
   - question types
   - number of questions (set a max, e.g. `maxQuestions = 20`)
   - any additional config you want (time limit, focus areas, etc.)
2. Provide a “Generate Quiz” button.

### 22.3 Gemini-backed quiz generation API
1. Add an endpoint such as `Tuned/src/app/api/gemini/quiz/generate/route.ts`.
2. Input payload includes:
   - the quiz configuration values
   - study outputs to derive the question set (e.g., concept map + scholar key terms + sprint cards + podcast transcript summary)
3. Output is a strict `QuizQuestion[]` payload matching your `Tuned/src/types` shape.
4. Enforce bounds (question count <= `maxQuestions`).

### 22.4 Loading state + navigation to `/quiz`
1. When “Generate Quiz” is clicked:
   - show loading inside the modal
   - disable controls to prevent duplicate requests
2. After generation:
   - navigate to `/quiz`

### 22.5 Implement `/quiz` page
1. Create `Tuned/src/app/quiz/page.tsx`.
2. Load quiz data:
   - via context if already available, otherwise via a dedicated endpoint (or `sessionId`).
3. Render quiz UI using your existing `useQuiz` + components where possible.
4. Provide “Exit Quiz” to return to dashboard.

**Acceptance criteria**
- Quiz only appears after study completion.
- Quiz config supports level/difficulty/types/count (bounded max like 20).
- Questions are generated by Gemini.
- Generation shows loading and then navigates to `/quiz`.

---

## Task 23: Route/content placement audit (confirm UI isn’t still mounted under the old study endpoint)
1. Search the codebase for components/pages mounted under `/study`.
2. Update them so upload/dashboard UI is reachable via the new dashboard URL and the new load-response step.

**Acceptance criteria**
- No core UI depends on `/study` route anymore.
- The “after upload processed” hydration happens via the new loading + redirect flow.

