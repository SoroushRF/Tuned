import { GoogleGenAI } from "@google/genai";
import { NeuroPrintVector } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// Pull the first available API key for the new SDK
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const PODCAST_PROMPT_EXTENSION = `
  [PODCAST EXPERT MODE]: The user has a high Auditory preference. 
  Ensure the podcast script is exceptionally rhythmic, uses conversational fillers (like "Wait," "Actually," "Think of it this way"), 
  and focuses on analogies that work well when heard. 
`;

const SPRINT_PROMPT_EXTENSION = `
  [SPRINT EXPERT MODE]: The user has high ADHD/Sprint energy. 
  Make sprint cards extremely punchy. No bullet point should exceed 10 words. 
  The "challenge" section MUST be a riddle or a quick mental puzzle.
`;

const SCHOLAR_PROMPT_EXTENSION = `
  [SCHOLAR EXPERT MODE]: The user has high Scholar depth. 
  Ensure the simplified text doesn't lose technical nuance. 
  Key terms should include etymology or exam-specific context (e.g., "Likely to appear in MCQ about...").
`;

export async function POST(req: NextRequest) {
  try {
    const { text, vector } = (await req.json()) as { text: string; vector: NeuroPrintVector };

    if (!text || !vector) {
      console.error("Nuro Error: Input context or profile vector is missing.");
      return NextResponse.json({ error: "Context or Vector missing" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("Nuro Error: GEMINI_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "API Key not configured." }, { status: 500 });
    }

    // 1. Build Personality Traits from Vector
    let personality = "Tone: Balanced and professional. ";
    if (vector.audio > 0.7) personality += "Enthusiastic, conversational, and rhythmic (Auditory focus). ";
    if (vector.adhd > 0.7) personality += "High-velocity, punchy, and minimal (Sprint/ADHD focus). ";
    if (vector.scholar > 0.7) personality += "Rigorous, analytical, and deeply technical (Scholar focus). ";

    // 2. Multi-Prompt Extension Strategy
    let promptExtensions = "";
    if (vector.audio > 0.5) promptExtensions += PODCAST_PROMPT_EXTENSION;
    if (vector.adhd > 0.5) promptExtensions += SPRINT_PROMPT_EXTENSION;
    if (vector.scholar > 0.5) promptExtensions += SCHOLAR_PROMPT_EXTENSION;

    const systemInstructionContent = `
      You are NURO, an adaptive AI study companion. 
      USER NEUROPRINT PERSONALITY: ${personality}
      ${promptExtensions}
      
      Your goal is to transform material into a unified JSON object matching this interface:
      {
        "sprintCards": [{ "id": "string", "title": "string", "bullets": ["string"], "challenge": "string", "visualPrompt": "string" }],
        "scholar": { "originalText": "string", "simplifiedText": "string", "keyTerms": [{ "term": "string", "definition": "string", "examRelevance": "string" }] },
        "podcast": { "segments": [{ "speaker": "A" | "B", "text": "string" }] },
        "conceptMapNodes": [{ "id": "string", "label": "string" }],
        "conceptMapEdges": [{ "source": "string", "target": "string" }]
      }
    `;

    const finalPrompt = `
      INPUT MATERIAL:
      "${text.substring(0, 15000)}"

      Transform this into the requested JSON. 
      CRITICAL: OUTPUT JSON ONLY. NO MARKDOWN.
    `;

    // Using the strict schema for generateContent in @google/genai v3
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        systemInstruction: { parts: [{ text: systemInstructionContent }] },
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    console.debug("Nuro Output Matrix (RAW):", responseText);
    
    // Robust JSON Finder
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
       console.error("Nuro Error: Gemini 3 returned invalid structure:", responseText);
       throw new Error("Invalid format returned by the AI matrix.");
    }
    
    const cleanJson = responseText.substring(start, end + 1).trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Nuro Synthesis FAILURE (Gemini 3 Debug):", error);
    return NextResponse.json({ error: error.message || "Neural synthesis failed." }, { status: 500 });
  }
}
