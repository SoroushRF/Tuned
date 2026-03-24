import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini API Client
 * Uses the API key from environment variables (process.env.GEMINI_API_KEY).
 */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini calls will fail.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * Helper to get a specific model instance
 */
export const getModel = (modelName: string) => {
  return genAI.getGenerativeModel({ model: modelName });
};
