# Scholar QA Checklist

Use this to verify Scholar mode after changes.

## Core Flow

- Open a session with Scholar as the dominant mode.
- Confirm the reading view shows chunk/page navigation.
- Confirm the original and simplified panes show side by side.
- Confirm the mode can switch between split and focus layouts.

## Chunk Navigation

- Move forward and backward through chunks.
- Jump directly to a chunk using the chip row.
- Confirm the active chunk label and page counter update.
- Confirm the current chunk source label is shown.

## Highlighted Terms

- Click a highlighted word in the reading pane.
- Confirm the term detail panel updates.
- Confirm the term chips below the panes also select the term.
- Confirm Escape clears the active term.

## Reading Depth

- Move the depth slider to a lower setting and confirm the text becomes more compact.
- Move the depth slider higher and confirm more detail stays visible.
- Confirm the label changes between compact and full-detail states.

## Keyboard

- `ArrowLeft` or `A` moves to the previous chunk.
- `ArrowRight` or `D` moves to the next chunk.
- `S` switches to split view.
- `F` switches to focus view.
- `Q` toggles the layout.
- `[` and `]` decrease or increase reading depth.
- `1` to `4` selects the corresponding key term.
- `Escape` clears the current term.

## Debug

- Run with `SCHOLAR_DEBUG=1`.
- Confirm console logs show chunk changes, term selection, and reading-depth updates.
- Confirm the logs include the current chunk index and active term.

