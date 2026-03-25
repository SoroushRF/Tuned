import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Client
 * Uses the API key from environment variables (process.env.GEMINI_API_KEY).
 */

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini calls will fail.");
}

export const ai = new GoogleGenAI({ apiKey });

/**
 * Helper for generating content using the new SDK format.
 * (Note: The new SDK prefers models.generateContent)
 */
export const generateContent = (model: string, prompt: string) => {
  return ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
};
