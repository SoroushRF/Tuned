import { GoogleGenerativeAI } from "@google/generative-ai";
import { NeuroPrintVector, ProcessedOutput } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyASBnD1d90JNrwx_dIDEOTXgpt9_72X6IQ";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Parsa - Core Transformation Engine
 * Uses the user's NeuroPrint vector to weight the output generation.
 */
export async function transformContent(text: string, vector: NeuroPrintVector): Promise<ProcessedOutput> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    You are NURO, an AI-powered study companion.
    User's NeuroPrint Profile (Weight 0-1):
    Audio Focus: ${vector.audio}
    ADHD/Sprint Focus: ${vector.adhd}
    Scholar Depth: ${vector.scholar}

    Input Material:
    "${text.substring(0, 10000)}"

    TASK:
    Transform this content into 3 adaptive formats simultaneously. Return a JSON object ONLY matching this interface:
    {
      "sessionId": "string",
      "sprintCards": [{ "id": "string", "title": "string", "bullets": ["string"], "challenge": "string", "visualPrompt": "string" }],
      "scholar": { "originalText": "string", "simplifiedText": "string", "keyTerms": [{ "term": "string", "definition": "string", "examRelevance": "string" }] },
      "podcast": { "segments": [{ "speaker": "A"|"B", "text": "string" }] }
    }

    ADAPTIVE CONSTRAINTS:
    1. Podcast (Audio): Make it a conversational debate between Host A and Expert B. Ensure it weighs more content if Audio > 0.6.
    2. Sprint Cards (ADHD): If ADHD > 0.6, make cards shorter, punchier, with frequent micro-challenges.
    3. Scholar (Deep-Text): If Scholar > 0.6, ensure definitions are technically rigorous but clearly explained. Key terms should be exam-focused.

    JSON OUTPUT ONLY. NO MARKDOWN. NO INTRO. NO OUTRO.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanJson = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    return {
      ...data,
      sessionId: Math.random().toString(36).substring(7),
      neuroPrint: vector
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process content. Possible API limit or invalid JSON.");
  }
}
