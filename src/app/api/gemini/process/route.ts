import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { GEMINI_CORE_MODEL } from "@/lib/gemini/models";
import { NeuroPrintVector, SprintCard, ScholarContent, PodcastScript } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  isGeminiDebugEnabled,
  summarizeText,
} from "@/lib/gemini/debug";
import { buildScholarChunkManifest } from "@/lib/scholar/chunking";

// Pull the first available API key for the new SDK
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const PODCAST_MAX_SEGMENTS = 4;
const PODCAST_MAX_WORDS = 160;

const IMAGE_MAX_COUNT = 5;
const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const MAX_UPLOAD_POLL_MS = 180_000;
const POLL_INTERVAL_MS = 1_000;
const MAX_GENERATE_CONTENT_MS = 180_000;

const PODCAST_PROMPT_EXTENSION = `
  [PODCAST EXPERT MODE]: The user has a high Auditory preference. 
  Ensure the podcast script is calm, academic, and tightly structured. 
  Use clear phrasing, minimal filler, and short explanatory transitions. 
  It should feel like a concise study recap rather than a performance. 
`;

const SPRINT_PROMPT_EXTENSION = `
  [SPRINT EXPERT MODE]: The user has high ADHD/Sprint energy. 
  Make sprint cards extremely punchy. No bullet point should exceed 10 words. 
  The "challenge" section MUST be a riddle or a quick mental puzzle.
`;

const SCHOLAR_PROMPT_EXTENSION = `
  [SCHOLAR EXPERT MODE]: The user has high Scholar depth.
  Build a side-by-side reading experience with chunked page-like sections, simplified rewrites, highlighted jargon, and concise term explanations.
  Preserve technical nuance while making the language easier to follow.
  Every chunk should include a short summary, highlighted terms, and the key terms for that section.
`;

function trimPodcastText(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { text: text.trim(), wasTrimmed: false };
  }

  return {
    text: `${words.slice(0, maxWords).join(' ')}...`,
    wasTrimmed: true,
  };
}

function getFileExtension(fileName: string) {
  const ext = fileName.split(".").pop();
  return (ext || "").toLowerCase();
}

function guessImageMimeType(file: File): string | null {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const ext = getFileExtension(file.name);
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return null;
}

function shortenPodcastSegments(script: { segments: { speaker: 'A' | 'B'; text: string }[] }) {
  let remainingWords = PODCAST_MAX_WORDS;
  let shortened = false;

  const nextSegments: { speaker: 'A' | 'B'; text: string }[] = [];

  for (const segment of script.segments) {
    if (nextSegments.length >= PODCAST_MAX_SEGMENTS || remainingWords <= 0) {
      shortened = true;
      break;
    }

    const words = segment.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      continue;
    }

    const maxWordsForSegment = Math.max(18, Math.floor(remainingWords / Math.max(1, PODCAST_MAX_SEGMENTS - nextSegments.length)));
    const limit = Math.min(words.length, maxWordsForSegment, remainingWords);
    const trimmed = trimPodcastText(segment.text, limit);
    shortened = shortened || trimmed.wasTrimmed || words.length > limit;

    nextSegments.push({
      speaker: segment.speaker,
      text: trimmed.text,
    });

    remainingWords -= limit;
  }

  if (script.segments.length > nextSegments.length) {
    shortened = true;
  }

  return {
    segments: nextSegments.length > 0 ? nextSegments : script.segments.slice(0, 1),
    isShortened: shortened,
    targetDurationSeconds: shortened ? 60 : undefined,
  };
}

export async function POST(req: NextRequest) {
  const requestId = createGeminiDebugId("process");
  const startedAt = Date.now();
  try {
    const contentType = req.headers.get("content-type") || "";
    let text = "";
    let vector: NeuroPrintVector | null = null;
    const pdfFiles: File[] = [];
    const imageFiles: File[] = [];
    const audioFiles: File[] = [];

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
      formData.getAll("images").forEach((value) => {
        if (value instanceof File) {
          imageFiles.push(value);
        }
      });
      formData.getAll("audios").forEach((value) => {
        if (value instanceof File) {
          audioFiles.push(value);
        }
      });
    } else {
      const body = (await req.json()) as { text: string; vector: NeuroPrintVector };
      text = body.text;
      vector = body.vector;
    }

    if (
      (!text && pdfFiles.length === 0 && imageFiles.length === 0) ||
      !vector
    ) {
      console.error("Nuro Error: Input context or profile vector is missing.");
      return NextResponse.json({ error: "Context or Vector missing" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("Nuro Error: GEMINI_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "API Key not configured." }, { status: 500 });
    }

    // Reject audio for now (clear error instead of silently ignoring it).
    if (audioFiles.length > 0) {
      return NextResponse.json(
        { error: "Audio uploads are not supported yet. Please provide a text transcript instead." },
        { status: 400 }
      );
    }

    if (imageFiles.length > IMAGE_MAX_COUNT) {
      return NextResponse.json(
        { error: `Too many images. Max ${IMAGE_MAX_COUNT} images allowed per request.` },
        { status: 400 }
      );
    }

    for (const imageFile of imageFiles) {
      if (imageFile.size > IMAGE_MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Image ${imageFile.name} is too large. Max ${IMAGE_MAX_SIZE_BYTES / (1024 * 1024)}MB.` },
          { status: 400 }
        );
      }
      const guessedMime = guessImageMimeType(imageFile);
      if (!guessedMime) {
        return NextResponse.json(
          { error: `Unsupported image type for ${imageFile.name}. Allowed: jpeg, png, webp, gif.` },
          { status: 400 }
        );
      }
    }

    const scholarBundle = buildScholarChunkManifest(text, pdfFiles.map((file) => file.name));

    logGeminiRequest("process", requestId, {
      textLength: text.length,
      textPreview: summarizeText(text, 500),
      vector,
      pdfCount: pdfFiles.length,
      pdfNames: pdfFiles.map((file) => file.name),
      imageCount: imageFiles.length,
      imageNames: imageFiles.map((file) => file.name),
      scholarSourceCount: scholarBundle.sourceCount,
      scholarChunkCount: scholarBundle.chunkCount,
      model: GEMINI_CORE_MODEL,
    });

    // 1. Build Personality Traits from Vector
    let personality = "Tone: Balanced and professional. ";
    if (vector.audio > 0.7) personality += "Measured, articulate, and lecture-like (Auditory focus). ";
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
      - For AUDIO: Make the podcast script concise, multi-perspective, and calm. Prefer 3 to 4 short exchanges, use minimal filler, and keep the spoken length close to 1 minute or under.
      - For ADHD/SPRINT: Make the cards concise, focused, and low-overwhelm. Use one concept per card, at most 3 bullets, and a calm challenge question. Avoid hype, riddles, and long paragraphs.
      - For SCHOLAR: Provide a side-by-side scholarly reading output with chunked page-like sections, simplified rewrites, highlighted jargon, and concise term explanations.
      
      Your goal is to transform material into a unified JSON object matching this interface:
      {
        "sprintCards": [{ "id": "string", "title": "string", "bullets": ["string"], "challenge": "string", "diagramPrompt": "string", "status": "pending", "rescue": { "reframeText": "string", "hint": "string", "visualAid": "string" } }],
        "scholar": { "originalText": "string", "simplifiedText": "string", "keyTerms": [{ "term": "string", "definition": "string", "examRelevance": "string" }], "highlightedTerms": ["string"], "sourceLabels": ["string"], "chunks": [{ "chunkId": "string", "sourceLabel": "string", "pageLabel": "string", "originalText": "string", "simplifiedText": "string", "summary": "string", "highlightedTerms": ["string"], "keyTerms": [{ "term": "string", "definition": "string", "examRelevance": "string" }] }] },
        "podcast": { "segments": [{ "speaker": "A" | "B", "text": "string" }] },
        "conceptMapNodes": [{ "id": "string", "label": "string" }],
        "conceptMapEdges": [{ "source": "string", "target": "string" }]
      }

      CRITICAL CONSTRAINTS:
      1. All keys in the interface MUST be populated with valid, creative content based on the input.
      2. If a section seems difficult to populate from raw text alone, use your depth as an AI to synthesize relevant academic context.
      3. NEVER return empty arrays ([]) or empty objects for any of the required keys.
      4. Ensure at least 3 sprintCards and 3 podcast segments. Prefer 4 or fewer podcast segments when the audio mode is dominant.
    `;

    const finalPrompt = `
      SCHOLAR READING MAP:
      ${scholarBundle.manifest}

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
      const pollDeadline = Date.now() + MAX_UPLOAD_POLL_MS;
      while (fileRecord.state !== "ACTIVE" && fileRecord.state !== "FAILED") {
        if (Date.now() > pollDeadline) {
          throw new Error("Gemini file processing timed out");
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
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

    const uploadedImageParts = [];
    for (const imageFile of imageFiles) {
      const guessedMime = guessImageMimeType(imageFile);
      // Validation above guarantees guessedMime is not null.
      const uploaded = await ai.files.upload({
        file: imageFile,
        config: {
          displayName: imageFile.name,
          mimeType: guessedMime ?? imageFile.type,
        },
      });

      let fileRecord = uploaded;
      const pollDeadline = Date.now() + MAX_UPLOAD_POLL_MS;
      while (fileRecord.state !== "ACTIVE" && fileRecord.state !== "FAILED") {
        if (Date.now() > pollDeadline) {
          throw new Error("Gemini file processing timed out");
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (!fileRecord.name) {
          throw new Error(`Gemini did not return a file name for ${imageFile.name}`);
        }
        fileRecord = await ai.files.get({ name: fileRecord.name });
      }

      if (fileRecord.state === "FAILED") {
        throw new Error(`Failed to upload Image: ${imageFile.name}`);
      }

      if (!fileRecord.uri) {
        throw new Error(`Gemini did not return a URI for ${imageFile.name}`);
      }

      const uri = fileRecord.uri;
      const mimeType = fileRecord.mimeType ?? guessedMime ?? imageFile.type;
      uploadedImageParts.push(createPartFromUri(uri, mimeType || "image/png"));
    }

    // 3. System Synthesis
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const responsePromise = ai.models.generateContent({
      model: GEMINI_CORE_MODEL,
      contents: [{
        role: "user",
        parts: [{ text: finalPrompt }, ...uploadedPdfParts, ...uploadedImageParts],
      }],
      config: {
        systemInstruction: { parts: [{ text: systemInstructionContent }] },
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Gemini generateContent timed out")), MAX_GENERATE_CONTENT_MS);
    });

    let response;
    try {
      response = await Promise.race([responsePromise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    const responseText = response.text || "";
    logGeminiResponse("process", requestId, Date.now() - startedAt, {
      responseLength: responseText.length,
      responsePreview: summarizeText(responseText, 500),
    });
    // Never print full model output in production logs.
    if (isGeminiDebugEnabled()) {
      console.log("------------------------ NURO RESPONSE RAW ------------------------");
      console.log(responseText);
      console.log("-------------------------------------------------------------------");
    } else {
      console.log(`[gemini:process] ${requestId} responseLength=${responseText.length}`);
    }
    
    // Robust JSON Finder
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
       console.error("Nuro Error: Gemini 3 returned invalid structure:", responseText);
       throw new Error("Invalid format returned by the AI matrix.");
    }
    
    const cleanJson = responseText.substring(start, end + 1).trim();
    const parsed = JSON.parse(cleanJson) as {
      sprintCards?: SprintCard[];
      scholar?: Partial<ScholarContent>;
      podcast?: PodcastScript;
      conceptMapNodes?: { id: string; label: string }[];
      conceptMapEdges?: { source: string; target: string }[];
    };

    const fallbackKeyTerm = {
      term: "Key Concept",
      definition: "A central idea distilled from the uploaded material.",
      examRelevance: "Helps you connect the idea to recall and application.",
    };

    const fallbackSprintCards: SprintCard[] = [
      {
        id: "fallback-sprint-1",
        title: "Focus Block 1",
        bullets: ["Extract the core idea", "Connect it to the material", "Answer the clue"],
        challenge: "What is the single core idea you should remember?",
        diagramPrompt: "A simple diagram with one center node and three supporting bubbles.",
        status: "pending",
        rescue: {
          reframeText: "Look for one repeated theme and one key relationship in the material.",
          hint: "Try summarizing the material in a single sentence.",
          visualAid: "A one-sentence summary box linked to the theme.",
        },
      },
      {
        id: "fallback-sprint-2",
        title: "Focus Block 2",
        bullets: ["Name key parts", "Explain the link", "Stay concise"],
        challenge: "Which piece connects the rest of the information together?",
        diagramPrompt: "A concept map with two nodes connected by a labeled edge.",
        status: "pending",
      },
      {
        id: "fallback-sprint-3",
        title: "Focus Block 3",
        bullets: ["Practice recall", "Test with a question", "Adjust based on confusion"],
        challenge: "What question would you ask to test this idea?",
        diagramPrompt: "A question icon connected to a checklist.",
        status: "pending",
      },
    ];

    const fallbackPodcast: PodcastScript = {
      segments: [
        { speaker: "A", text: "Welcome. Let’s turn your material into a quick study recap." },
        { speaker: "B", text: "First, we’ll extract the core idea and key relationships." },
        { speaker: "A", text: "Then we’ll summarize into clear, actionable learning prompts." },
      ],
    };

    const fallbackScholar: ScholarContent = {
      originalText: text || "Uploaded material.",
      simplifiedText: summarizeText(text || "", 900),
      keyTerms: [fallbackKeyTerm],
      highlightedTerms: [fallbackKeyTerm.term],
      sourceLabels: ["Uploaded Material"],
    };

    const sprintCards =
      Array.isArray(parsed.sprintCards) && parsed.sprintCards.length > 0
        ? parsed.sprintCards
        : fallbackSprintCards;

    const podcast =
      parsed.podcast?.segments && Array.isArray(parsed.podcast.segments) && parsed.podcast.segments.length > 0
        ? parsed.podcast
        : fallbackPodcast;

    const shortenedPodcast = shortenPodcastSegments(podcast);
    const normalizedPodcast: PodcastScript = {
      ...podcast,
      ...shortenedPodcast,
    };

    if (isGeminiDebugEnabled()) {
      console.log(`[gemini:process] ${requestId} podcast details`, {
        podcastSegmentCount: normalizedPodcast.segments.length,
        podcastWasShortened: Boolean(shortenedPodcast.isShortened),
        podcastTargetDurationSeconds: shortenedPodcast.targetDurationSeconds ?? null,
      });
    }

    const scholar = parsed.scholar;
    const keyTerms =
      Array.isArray(scholar?.keyTerms) && scholar!.keyTerms.length > 0
        ? scholar!.keyTerms
        : fallbackScholar.keyTerms;

    const normalizedScholar: ScholarContent = {
      ...fallbackScholar,
      ...(scholar || {}),
      keyTerms,
      highlightedTerms: Array.isArray(scholar?.highlightedTerms) ? scholar!.highlightedTerms : fallbackScholar.highlightedTerms,
      sourceLabels: Array.isArray(scholar?.sourceLabels) ? scholar!.sourceLabels : fallbackScholar.sourceLabels,
      chunks: Array.isArray(scholar?.chunks) && scholar!.chunks.length > 0 ? scholar!.chunks : undefined,
    };

    const conceptMapNodes =
      Array.isArray(parsed.conceptMapNodes) && parsed.conceptMapNodes.length > 0
        ? parsed.conceptMapNodes
        : [{ id: "cm-1", label: fallbackKeyTerm.term }];

    const conceptMapEdges =
      Array.isArray(parsed.conceptMapEdges) && parsed.conceptMapEdges.length > 0
        ? parsed.conceptMapEdges
        : [{ source: "cm-1", target: "cm-1" }];

    return NextResponse.json({
      sprintCards,
      scholar: normalizedScholar,
      podcast: normalizedPodcast,
      conceptMapNodes,
      conceptMapEdges,
    });

  } catch (error: unknown) {
    logGeminiError("process", requestId, error);
    console.error("Nuro Synthesis FAILURE (Gemini 3 Debug):", error);
    const message = error instanceof Error ? error.message : "Neural synthesis failed.";
    const status = message.toLowerCase().includes("timed out") ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
