# Scholar Mode Implementation Plan

## Goal
Turn Scholar mode into a polished study experience that takes all uploaded materials, splits them into manageable page chunks, simplifies them without losing meaning, and presents the original and simplified text side by side. The mode should also identify difficult terms, surface them in the UI, and let the user interact with the highlighted language.

## Current Gap
- We already have a basic Scholar panel and route.
- What is missing is the full product experience:
  - chunking uploaded files into page-sized or section-sized units
  - side-by-side original/simplified reading
  - automatic jargon detection
  - highlighted terms with UI catch points
  - tooltips or inline explanations
  - a smooth flow across large multi-file inputs

## Task 1. Define the Scholar data contract
- Lock a stable schema for Scholar output so the UI and Gemini prompt stay aligned.
- Add support for:
  - source file metadata
  - chunked page groups
  - original text blocks
  - simplified text blocks
  - highlighted terms
  - term definitions
  - term importance / exam relevance
  - optional notes or warnings for weak extraction
- Make sure the contract works for both PDFs and text-like inputs.

## Task 2. Build the file chunking pipeline
- Accept every file the user uploads into Scholar mode.
- Break documents into page-level or section-level chunks before sending them to Gemini.
- Preserve ordering across files so the side-by-side output maps back to the source.
- Include chunk IDs and page numbers so the UI can navigate cleanly.
- If a file is too large, split it into smaller chunks instead of truncating everything blindly.

## Task 3. Upgrade the Scholar prompt
- Rewrite the Scholar prompt so Gemini returns structured, side-by-side material.
- Ask Gemini to produce:
  - the original excerpt
  - a simplified rewrite
  - highlighted jargon or difficult terms
  - plain-language definitions
  - exam relevance notes
- Keep the tone academic and calm.
- Avoid over-simplifying the content so the meaning stays intact.
- Make the output deterministic enough for rendering in the UI.

## Task 4. Make the Scholar API production-grade
- Keep a single Scholar generation endpoint.
- Validate incoming files and chunk metadata before prompting Gemini.
- Add debug logging for:
  - request ID
  - file count
  - total page count
  - chunk count
  - response time
  - parse failures
- Return a consistent error shape so the UI can recover gracefully.

## Task 5. Build the side-by-side reading model
- Redesign the Scholar panel into a two-column layout.
- Left side:
  - original text
  - page/chunk navigation
  - highlighted jargon
- Right side:
  - simplified text
  - term explanations
  - key takeaways
- Keep the layout responsive so it stacks cleanly on small screens.
- Let the user move through chunks without losing context.

## Task 6. Add jargon detection and markup
- Detect technical jargon and difficult words in the returned text.
- Mark those terms in the original text.
- Keep the marks subtle but obvious enough to click or hover.
- Use the same term list to highlight the simplified side where relevant.
- Make sure repeated terms share the same explanation.

## Task 7. Wire highlighted terms into the UI
- When the user clicks or hovers a marked term:
  - show the definition
  - show the exam relevance note
  - show the term in a compact tooltip or drawer
- Keep the interaction fast and non-blocking.
- Make sure keyboard focus can reach the highlighted words.
- Provide a clear “close” or “dismiss” behavior.

## Task 8. Add page and chunk navigation
- Allow users to move through chunks or page groups one at a time.
- Show where they are in the material without making the UI feel overwhelming.
- Support:
  - next / previous chunk
  - jump to a section
  - quick return to a previous chunk
- Keep navigation lightweight and useful for long documents.

## Task 9. Add simplification tuning
- Let the Scholar mode adapt how aggressively it simplifies text.
- Keep the simplification conservative so it doesn’t erase technical meaning.
- Support a difficulty slider or reading-depth control.
- Feed that setting back into NeuroPrint if the user changes it enough times.

## Task 10. Add concept extraction and study scaffolding
- Pull out key terms, definitions, and core ideas from each chunk.
- Add a compact summary or takeaway block for each section.
- Keep exam relevance visible where it helps learning.
- Make the mode feel like a guided reading assistant, not just a translation layer.

## Task 11. Add accessibility and polish
- Ensure highlighted terms are usable with keyboard navigation.
- Make the side-by-side view readable at smaller sizes.
- Add strong focus rings and accessible tooltip behavior.
- Keep the styling academic, calm, and uncluttered.

## Task 12. Add debug and QA
- Log Scholar generation and parsing in terminal debug mode.
- Test:
  - multiple files
  - large PDFs
  - chunk navigation
  - highlighted jargon
  - tooltip behavior
  - mobile stacking
- Confirm the UI still works when extraction is weak or the model returns incomplete output.

## Suggested Build Order
1. Data contract
2. Chunking pipeline
3. Prompt rewrite
4. API hardening
5. Side-by-side UI
6. Jargon detection and markup
7. Term UI and tooltips
8. Navigation
9. Simplification tuning
10. Learning scaffolding
11. Accessibility and polish
12. Debug and QA

## What Done Looks Like
- The user uploads one or many files.
- Scholar breaks them into clean chunks.
- The screen shows original text on one side and simplified text on the other.
- Technical words are highlighted automatically.
- Clicking a marked word reveals a helpful explanation.
- The mode feels calm, academic, and useful for studying long materials.

