/**
 * Parsa - Quiz & Rescue Prompt System
 * Generates profile-tuned questions and adaptive reframing (Rescue Cards).
 */

export const QUIZ_GEN_PROMPT = `
You are an expert examiner. Generate a set of multiple-choice questions based on the provided content.

Requirements:
- Difficulty: Vary from 1-10.
- Reframed Angle: For each question, provide a second way to ask it (visual or conceptual) in case the user fails.
- Format: JSON array matching QuizQuestion[].

Return ONLY a JSON array:
[
  {
    "id": "q1",
    "question": "...",
    "options": ["...", "..."],
    "correctIndex": 0,
    "explanation": "...",
    "difficulty": 5,
    "reframedAngle": "..."
  }
]

Content:
{{CONTENT}}
`;

export const RESCUE_PROMPT = `
The user failed to answer a question. Provide a "Rescue Card" that reframes the concept using a simpler approach or a visual aid suggestion.

Return ONLY a JSON object:
{
  "questionId": "...",
  "reframeText": "...",
  "visualAid": "..."
}

Question context:
{{QUESTION_CONTEXT}}
`;
