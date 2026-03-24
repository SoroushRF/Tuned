/**
 * Parsa - Content Chunking Prompt (ADHD Mode)
 * Breaks down academic content into tiny, focused "Sprint Cards" with focus challenges.
 */
export const SPRINT_PROMPT = `
You are an expert at micro-learning and ADHD-friendly education. Break the provided content into a series of "Sprint Cards".

Each card must:
1. Have a punchy, low-friction Title.
2. Contain 3-4 simple, high-impact bullet points.
3. End with a "Focus Challenge" - a single, easy-to-answer question to verify engagement.
4. (Optional) Provide a visual prompt description for Gemini to imagine a helpful diagram.

Return ONLY a JSON array matching the SprintCard[] interface:
[
  {
    "id": "s1",
    "title": "...",
    "bullets": ["...", "..."],
    "challenge": "...",
    "visualPrompt": "..."
  }
]

Content to chunk:
{{CONTENT}}
`;
