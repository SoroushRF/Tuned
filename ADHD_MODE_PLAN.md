# ADHD Mode Implementation Plan

## Goal
Build Sprint into a focused, motivating, low-overwhelm study mode that feels intentional, adaptive, and complete, not just a card list.

## Current Gap
- We already have a basic sprint panel and API route.
- What’s missing is the full ADHD experience from the product doc: focus mode, hidden total progress, constellation-style progression, rescue cards, opt-in timer, streaks, and polished transitions.

## Task 1. Lock the sprint data contract
- Define the final `SprintCard` shape so UI, API, and prompts stay aligned.
- Add support for:
  - concept title
  - 3 bullets max
  - optional diagram prompt
  - challenge question
  - completion state
  - optional rescue content
- Decide the response shape from the sprint API once and keep it stable.

## Task 2. Upgrade the sprint prompt
- Rewrite `prompts/sprint.ts` so Gemini always returns ADHD-friendly output.
- Enforce:
  - one concept per card
  - short, plain language
  - short bullets
  - no huge paragraphs
  - motivational, non-judgmental tone
- Ask for output that is easy to scan in focus mode.
- Make the prompt explicitly avoid showing all remaining cards up front.

## Task 3. Make the sprint API production-grade
- Keep `/api/gemini/sprint` as the core generation endpoint.
- Validate input content before sending to Gemini.
- Trim or chunk overly large content so sprint generation stays fast.
- Add debug logging for:
  - request ID
  - input length
  - output count
  - response latency
  - parse failures
- Make failure responses clear enough for the UI to fall back gracefully.

## Task 4. Build the sprint state machine
- Create a dedicated `useSprint` hook that manages:
  - current card index
  - completed cards
  - streak count
  - timer state
  - rescue state
  - progress constellation state
- Make the sprint flow deterministic and testable.
- Keep the state separate from general study session state.

## Task 5. Redesign the sprint UI into a focus experience
- Turn the current sprint panel into a product-level focus mode.
- Show only the current concept by default.
- Hide the total number of cards until the end.
- Use a strong single-card layout with:
  - title
  - 3 bullets max
  - one challenge question
  - one clear action button
- Add motion that feels intentional, not flashy.

## Task 6. Build constellation progress
- Replace a traditional progress bar with a constellation or node map.
- Reveal nodes as the user completes cards.
- Never show how many total cards exist until the session ends.
- Animate each completion as a reward moment.
- Use additive language like “You’ve covered 4 concepts.”

## Task 7. Add opt-in countdown timer
- Add a timer only after the user starts engaging with sprint mode.
- Frame it as a power-up, not pressure.
- Keep it off by default.
- Make it easy to dismiss and ignore.
- Store the user’s choice in session state.

## Task 8. Add streaks and milestone moments
- Track consecutive completed cards or correct responses.
- Show milestone messages after every 3 sprints, or whatever threshold we settle on.
- Make the copy encouraging and brief.
- Avoid punishment language.
- Reward momentum, not perfection.

## Task 9. Build rescue cards
- When the user gets a challenge wrong, show a rescue card instead of a harsh error.
- Rescue cards should:
  - re-explain the concept in simpler wording
  - give a smaller hint
  - let the user try again
- Never say “incorrect” or “wrong.”
- Keep the tone supportive and calm.

## Task 10. Add adaptive difficulty signals
- Let sprint behavior feed back into NeuroPrint.
- Positive signals:
  - completing sprint cards
  - engaging with the timer
  - finishing without skipping
- Negative signals:
  - repeated skipping
  - repeatedly dismissing sprint mode
- Debounce updates so one bad click does not change the profile.

## Task 11. Tune layout behavior from NeuroPrint
- Use the `adhd` score to decide whether sprint should be primary, suggested, or hidden.
- Keep the sprint mode dominant only when ADHD score is high enough.
- Support blended profiles if needed later.
- Make the layout logic match the thresholds in the product doc.

## Task 12. Make the visuals feel less like a game UI
- Keep the energy, but reduce “shiny” UI behavior.
- Use quieter shadows, calmer motion, and more academic spacing.
- Keep rewards subtle.
- Make the experience feel smart and helpful, not arcade-like.

## Task 13. Add accessibility and keyboard controls
- Make sure cards are usable without a mouse.
- Add keyboard navigation for next, back, retry, and dismiss.
- Ensure focus states are obvious.
- Keep timer and constellation readable on smaller screens.

## Task 14. QA and debug
- Test:
  - first-card load
  - full sprint completion
  - timer opt-in and opt-out
  - wrong-answer rescue flow
  - streak and milestone updates
  - hidden total progress behavior
- Add terminal debug logs for sprint generation and state transitions.
- Make sure sprint does not depend on podcast logic.

## Suggested Build Order
1. Data contract and prompt
2. Sprint API hardening
3. Sprint state machine
4. Focus-mode UI
5. Constellation progress
6. Timer and streaks
7. Rescue cards
8. NeuroPrint feedback
9. Polish and QA

## What Done Looks Like
- A user lands in sprint mode and immediately sees one focused concept.
- They never feel overwhelmed by a giant list.
- Progress feels like a journey, not a checklist.
- Wrong answers feel recoverable.
- The mode visibly adapts to their behavior.
- It feels as complete and intentional as the podcast feature.
