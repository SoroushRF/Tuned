import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { NeuroPrintVector } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from "@/lib/gemini/debug";

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
  const requestId = createGeminiDebugId("process");
  const startedAt = Date.now();
  try {
    const contentType = req.headers.get("content-type") || "";
    let text = "";
    let vector: NeuroPrintVector | null = null;
    const pdfFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      text = String(formData.get("text") || "");
      const vectorRaw = String(formData.get("vector") || "");
      vector = vectorRaw ? (JSON.parse(vectorRaw) as NeuroPrintVector) : null;
      formData.getAll("pdfs").forEach((value) => {
        if (value instanceof File) {
          pdfFiles.push(value);
        }
      });
    } else {
      const body = (await req.json()) as { text: string; vector: NeuroPrintVector };
      text = body.text;
      vector = body.vector;
    }

    if ((!text && pdfFiles.length === 0) || !vector) {
      console.error("Nuro Error: Input context or profile vector is missing.");
      return NextResponse.json({ error: "Context or Vector missing" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("Nuro Error: GEMINI_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "API Key not configured." }, { status: 500 });
    }

    logGeminiRequest("process", requestId, {
      textLength: text.length,
      textPreview: summarizeText(text, 500),
      vector,
      pdfCount: pdfFiles.length,
      pdfNames: pdfFiles.map((file) => file.name),
      model: "gemini-2.5-flash",
    });

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
    const scores = [
      { id: 'audio', val: vector.audio },
      { id: 'adhd', val: vector.adhd },
      { id: 'scholar', val: vector.scholar },
    ];
    const dominantMode = scores.sort((a, b) => b.val - a.val)[0].id;

    const systemInstructionContent = `
      You are NURO, an adaptive AI study companion. 
      USER NEUROPRINT PERSONALITY: ${personality}
      ${promptExtensions}
      
      DOMINANT LEARNING MODE: ${dominantMode.toUpperCase()}
      [CRITICAL]: The user's highest dimension is ${dominantMode.toUpperCase()}. You MUST make this section of the JSON the "Hero Section" with the most creative effort, depth, and detail. 
      If ${dominantMode} is highest:
      - For AUDIO: Make the podcast script longer, multi-perspective, and high-energy.
      - For ADHD/SPRINT: Make the cards incredibly high-velocity, with many segments and riddles.
      - For SCHOLAR: Provide the most rigorous and academic simplified text with etymological breakdowns.
      
      Your goal is to transform material into a unified JSON object matching this interface:
      {
        "sprintCards": [{ "id": "string", "title": "string", "bullets": ["string"], "challenge": "string", "visualPrompt": "string" }],
        "scholar": { "originalText": "string", "simplifiedText": "string", "keyTerms": [{ "term": "string", "definition": "string", "examRelevance": "string" }] },
        "podcast": { "segments": [{ "speaker": "A" | "B", "text": "string" }] },
        "conceptMapNodes": [{ "id": "string", "label": "string" }],
        "conceptMapEdges": [{ "source": "string", "target": "string" }]
      }

      CRITICAL CONSTRAINTS:
      1. All keys in the interface MUST be populated with valid, creative content based on the input.
      2. If a section seems difficult to populate from raw text alone, use your depth as an AI to synthesize relevant academic context.
      3. NEVER return empty arrays ([]) or empty objects for any of the required keys.
      4. Ensure at least 3 sprintCards and 5 podcast segments.
    `;

    const finalPrompt = `
      INPUT MATERIAL:
      "${text.substring(0, 15000)}"
      ${text.trim() ? "" : "No extra text sources were provided. Use the uploaded PDF files as the primary source."}

      Transform this into the requested JSON. 
      CRITICAL: OUTPUT JSON ONLY. NO MARKDOWN.
    `;

    const uploadedPdfParts = [];
    for (const pdfFile of pdfFiles) {
      const uploaded = await ai.files.upload({
        file: pdfFile,
        config: {
          displayName: pdfFile.name,
          mimeType: pdfFile.type || "application/pdf",
        },
      });

      let fileRecord = uploaded;
      while (fileRecord.state !== "ACTIVE" && fileRecord.state !== "FAILED") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!fileRecord.name) {
          throw new Error(`Gemini did not return a file name for ${pdfFile.name}`);
        }
        fileRecord = await ai.files.get({ name: fileRecord.name });
      }

      if (fileRecord.state === "FAILED") {
        throw new Error(`Failed to upload PDF: ${pdfFile.name}`);
      }

      if (!fileRecord.uri) {
        throw new Error(`Gemini did not return a URI for ${pdfFile.name}`);
      }

      const uri = fileRecord.uri;
      const mimeType = fileRecord.mimeType ?? "application/pdf";

      uploadedPdfParts.push(
        createPartFromUri(uri, mimeType)
      );
    }

    // 3. System Synthesis
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: finalPrompt }, ...uploadedPdfParts],
      }],
      config: {
        systemInstruction: { parts: [{ text: systemInstructionContent }] },
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    logGeminiResponse("process", requestId, Date.now() - startedAt, {
      responseLength: responseText.length,
      responsePreview: summarizeText(responseText, 500),
    });
    console.log("------------------------ NURO RESPONSE RAW ------------------------");
    console.log(responseText);
    console.log("-------------------------------------------------------------------");
    
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
    logGeminiError("process", requestId, error);
    console.error("Nuro Synthesis FAILURE (Gemini 3 Debug):", error);
    return NextResponse.json({ error: error.message || "Neural synthesis failed." }, { status: 500 });
  }
}
