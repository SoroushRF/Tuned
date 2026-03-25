import { createPartFromUri, GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { SCHOLAR_PROMPT } from '@/prompts/scholar';
import { ScholarChunk, ScholarContent } from '@/types';
import { buildScholarChunkManifest } from '@/lib/scholar/chunking';
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from '@/lib/gemini/debug';

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function fallbackScholarChunks(content: string, sourceLabels: string[]): ScholarChunk[] {
  const normalized = content.trim();
  if (!normalized) return [];

  const labels = sourceLabels.length > 0 ? sourceLabels : ['Combined Material'];
  return labels.map((label, index) => ({
    chunkId: `chunk-${index + 1}`,
    sourceLabel: label,
    pageLabel: `Chunk ${index + 1}`,
    originalText: normalized,
    simplifiedText: normalized,
    summary: 'Fallback chunk generated from the uploaded material.',
    highlightedTerms: [],
    keyTerms: [],
  }));
}

function normalizeScholarContent(content: ScholarContent): ScholarContent {
  const highlightedTerms = uniqueStrings([
    ...(Array.isArray(content.highlightedTerms) ? content.highlightedTerms : []),
    ...(Array.isArray(content.keyTerms) ? content.keyTerms.map((term) => term.term) : []),
  ]);
  const sourceLabels = uniqueStrings(Array.isArray(content.sourceLabels) ? content.sourceLabels : []);
  const chunks = Array.isArray(content.chunks) && content.chunks.length > 0
    ? content.chunks.map((chunk, index) => ({
        chunkId: chunk.chunkId || `chunk-${index + 1}`,
        sourceLabel: chunk.sourceLabel || sourceLabels[index % Math.max(1, sourceLabels.length)] || 'Combined Material',
        pageLabel: chunk.pageLabel || `Chunk ${index + 1}`,
        originalText: chunk.originalText || content.originalText || '',
        simplifiedText: chunk.simplifiedText || content.simplifiedText || '',
        summary: chunk.summary || '',
        highlightedTerms: uniqueStrings([
          ...(Array.isArray(chunk.highlightedTerms) ? chunk.highlightedTerms : []),
          ...(Array.isArray(chunk.keyTerms) ? chunk.keyTerms.map((term) => term.term) : []),
        ]),
        keyTerms: Array.isArray(chunk.keyTerms) ? chunk.keyTerms.slice(0, 8) : [],
      }))
    : fallbackScholarChunks(content.originalText || content.simplifiedText || '', sourceLabels);

  return {
    ...content,
    keyTerms: Array.isArray(content.keyTerms) ? content.keyTerms.slice(0, 12) : [],
    highlightedTerms,
    sourceLabels,
    chunks,
  };
}

export async function POST(req: Request) {
  const requestId = createGeminiDebugId('scholar');
  const startedAt = Date.now();

  try {
    const contentType = req.headers.get('content-type') || '';
    let content = '';
    const pdfFiles: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      content = String(formData.get('content') || formData.get('text') || '');
      formData.getAll('pdfs').forEach((value) => {
        if (value instanceof File) {
          pdfFiles.push(value);
        }
      });
    } else {
      const body = (await req.json()) as { content?: string; text?: string };
      content = body.content ?? body.text ?? '';
    }

    if (!content && pdfFiles.length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });
    }

    const scholarBundle = buildScholarChunkManifest(content, pdfFiles.map((file) => file.name));
    const promptContent = `${scholarBundle.manifest}\n\nINPUT MATERIAL:\n${content}\n\nReturn JSON only.`;

    logGeminiRequest('scholar', requestId, {
      contentLength: content.length,
      contentPreview: summarizeText(content, 500),
      pdfCount: pdfFiles.length,
      pdfNames: pdfFiles.map((file) => file.name),
      scholarSourceCount: scholarBundle.sourceCount,
      scholarChunkCount: scholarBundle.chunkCount,
      route: 'scholar',
      model: 'gemini-2.5-flash',
    });

    const uploadedPdfParts = [];
    for (const pdfFile of pdfFiles) {
      const uploaded = await ai.files.upload({
        file: pdfFile,
        config: {
          displayName: pdfFile.name,
          mimeType: pdfFile.type || 'application/pdf',
        },
      });

      let fileRecord = uploaded;
      while (fileRecord.state !== 'ACTIVE' && fileRecord.state !== 'FAILED') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!fileRecord.name) {
          throw new Error(`Gemini did not return a file name for ${pdfFile.name}`);
        }
        fileRecord = await ai.files.get({ name: fileRecord.name });
      }

      if (fileRecord.state === 'FAILED') {
        throw new Error(`Failed to upload PDF: ${pdfFile.name}`);
      }

      if (!fileRecord.uri) {
        throw new Error(`Gemini did not return a URI for ${pdfFile.name}`);
      }

      uploadedPdfParts.push(createPartFromUri(fileRecord.uri, fileRecord.mimeType ?? 'application/pdf'));
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: SCHOLAR_PROMPT.replace('{{CONTENT}}', promptContent) }, ...uploadedPdfParts],
      }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    logGeminiResponse('scholar', requestId, Date.now() - startedAt, {
      responseLength: text.length,
      responsePreview: summarizeText(text, 500),
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError) {
      logGeminiError('scholar', requestId, parseError);
      return NextResponse.json(
        {
          error: 'Gemini returned an unreadable scholar payload.',
          requestId,
        },
        { status: 502 }
      );
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return NextResponse.json(
        {
          error: 'Gemini returned an invalid scholar payload shape.',
          requestId,
        },
        { status: 502 }
      );
    }

    const scholarContent = normalizeScholarContent(parsed as ScholarContent);

    return NextResponse.json(scholarContent);
  } catch (error) {
    logGeminiError('scholar', requestId, error);
    console.error('Scholar API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate scholar content';
    return NextResponse.json(
      {
        error: message.includes('API key')
          ? 'Scholar generation is unavailable because Gemini is not configured.'
          : 'Failed to generate scholar content',
        requestId,
      },
      { status: 500 }
    );
  }
}
