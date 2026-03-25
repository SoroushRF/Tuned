import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from "@/lib/gemini/debug";

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function POST(req: NextRequest) {
  const requestId = createGeminiDebugId("onboarding");
  const startedAt = Date.now();
  try {
    const { history, questions } = await req.json();

    // Build context from the survey history
    let context = "USER SURVEY RESPONSES:\n";
    Object.entries(history).forEach(([stepIdx, state]: [string, any]) => {
      const q = questions[parseInt(stepIdx)];
      context += `Q: ${q.text}\n`;
      if (state.selectedIndices.length > 0) {
        context += `A: ${state.selectedIndices.map((idx: number) => q.options[idx].label).join(", ")}\n`;
      }
      if (state.freeText) {
        context += `Free-form context provided by user: "${state.freeText}"\n`;
      }
    });

    logGeminiRequest("onboarding", requestId, {
      answersCount: Object.keys(history || {}).length,
      contextLength: context.length,
      contextPreview: summarizeText(context, 700),
      model: "gemini-2.5-flash",
    });

    const ai = genAI;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: context }]
      }],
      config: {
        systemInstruction: {
          parts: [{
            text: `
              You are the NURO Calibration Engine. Your goal is to generate a behavioral "NeuroPrint" vector [0 to 1] for 3 cognitive axes based on the user's study habits.
              
              AXES DEFINITIONS:
              1. "audio": Higher if the user learns better by listening, verbalizing, or prefers podcast-style formats.
              2. "adhd": Higher if the user has short attention spans, prefers high-velocity content, "sprint" style cards, or struggles with long blocks of text.
              3. "scholar": Higher if the user prefers rigorous academic depth, formal structures, and needs complex simplified models.

              OUTPUT JSON ONLY:
              {
                "audio": number (0.0 - 1.0),
                "adhd": number (0.0 - 1.0),
                "scholar": number (0.0 - 1.0),
                "archetype": "string (a creative 3-word name for this profile)"
              }
            `
          }]
        },
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const vectorResult = JSON.parse(resultText);
    logGeminiResponse("onboarding", requestId, Date.now() - startedAt, {
      responseLength: resultText.length,
      responsePreview: summarizeText(resultText, 500),
    });

    return NextResponse.json({
      ...vectorResult,
      lastUpdated: Date.now(),
      manualOverride: false
    });

  } catch (error) {
    logGeminiError("onboarding", requestId, error);
    console.error("Onboarding Analysis Error:", error);
    // Fallback to a neutral profile if AI fails
    return NextResponse.json({
      audio: 0.5,
      adhd: 0.5,
      scholar: 0.5,
      archetype: "Adaptive Student",
      lastUpdated: Date.now(),
      manualOverride: false
    });
  }
}
