# Sprint QA Checklist

Use this when verifying the ADHD / Sprint flow after changes.

## Core Flow

- Open a session that routes into Sprint mode.
- Confirm the screen starts in one-card focus mode.
- Confirm only the current card is visually dominant.
- Confirm the constellation progress lights up one node per completion.

## Keyboard

- `ArrowLeft` moves back one card.
- `ArrowRight` moves forward one card.
- `Enter` or `Space` completes the current card.
- `T` toggles the optional timer.
- `R` resets the current clue into rescue mode.
- `Escape` dismisses rescue or pauses/closes timer prompts.

## Timer

- Confirm the timer is off by default.
- Confirm the timer can be enabled, paused, resumed, and disabled.
- Confirm the countdown display updates once per second.

## Rescue

- Trigger rescue mode from a clue.
- Confirm the rescue card appears with calmer reframe text.
- Confirm `Back to clue` returns without completing the card.
- Confirm `I get it` completes the current card and advances.

## Progress

- Complete three cards and confirm the milestone message appears.
- Confirm the milestone clears on the next non-milestone completion.
- Confirm the total card count is not shown in the progress map.

## Debug

- Run the app with `SPRINT_DEBUG=1`.
- Confirm console logs show state transitions, card movement, and timer actions.
- Confirm the logs include current index, stage, streak, and remaining time.
