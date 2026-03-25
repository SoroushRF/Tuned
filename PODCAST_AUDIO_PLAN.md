# NotebookLM-Style Podcast Audio Plan

## Goal
Turn the podcast feature into a real, usable audio experience:
- Gemini generates an actual audio file
- the player supports scrubbing and seeking
- transcript and audio stay synchronized more accurately
- users can jump around the file naturally
- the output can be tuned to sound calmer, shorter, and more academic

## Current Status
- Task 1: backend audio generation route is in place
- Task 2: podcast panel now plays real generated audio
- Task 3 onward: refinement work still to do

## Task 3: Audio Navigation and Sync
Break the playback UI into proper timeline controls.

### Subtasks
- Replace the percentage display with a real scrubber
- Show current time and total duration
- Add skip backward and skip forward controls
- Allow the user to drag the scrubber to any point in the audio
- Keep transcript highlighting in sync with playback position

## Task 4: Sentence-Level Transcript Sync
Make the transcript behave more like a real podcast transcript.

### Subtasks
- Split podcast transcript into sentence-level chunks instead of broad segments
- Render each sentence as a clickable unit
- Let users click a sentence and jump the audio to that point
- Improve the current highlighting so it tracks sentence boundaries more closely
- If exact timestamps are not available from Gemini, use a light alignment layer

## Task 5: Shorter Podcast Control
Give the system better control over how long the generated podcast is.

### Subtasks
- Add a prompt instruction for podcasts under one minute when requested
- Trim or compress transcript input before audio generation if needed
- Add a server-side length guard so very long scripts do not produce huge audio
- Make the UI show when the podcast is intentionally shortened

## Task 6: Voice and Tone Tuning
Make the audio sound more like an academic overview and less like a hype reel.

### Subtasks
- Keep speaker A and B clearly distinct
- Use calmer, more scholarly wording in the generation prompt
- Reduce filler and over-expressive delivery
- Make the audio feel closer to a NotebookLM-style study recap

## Task 7: Debug and Quality Checks
Keep the feature easy to debug and hard to break.

### Subtasks
- Log route timing and request IDs in the terminal
- Log transcript length, sentence count, and audio length
- Surface clear user-facing errors when audio generation fails
- Test playback, seeking, transcript click-through, and fallback behavior
- Confirm the Gemini audio route still works after any prompt changes

## Suggested Execution Order
1. Add the scrubber and skip controls
2. Add sentence-level transcript click-to-seek
3. Improve sync accuracy
4. Add podcast shortening controls
5. Tune the voices and tone
6. Run final debug and QA pass
