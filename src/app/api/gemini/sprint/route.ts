import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SPRINT_PROMPT } from '@/prompts/sprint';
import { SprintCard } from '@/types';
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from '@/lib/gemini/debug';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const MAX_SPRINT_SOURCE_CHARS = 12000;

function compactSprintContent(content: string) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (normalized.length <= MAX_SPRINT_SOURCE_CHARS) {
    return { content: normalized, truncated: false, paragraphCount: normalized ? normalized.split(/\n{2,}/).length : 0 };
  }

  const paragraphs = normalized.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const selected: string[] = [];
  let totalLength = 0;

  for (const paragraph of paragraphs) {
    const chunkLength = paragraph.length + (selected.length > 0 ? 2 : 0);
    if (totalLength + chunkLength > Math.floor(MAX_SPRINT_SOURCE_CHARS * 0.65)) {
      break;
    }
    selected.push(paragraph);
    totalLength += chunkLength;
  }

  let tailBudget = Math.max(2000, MAX_SPRINT_SOURCE_CHARS - totalLength - 80);
  const tail: string[] = [];

  for (let i = paragraphs.length - 1; i >= 0; i -= 1) {
    const paragraph = paragraphs[i];
    const chunkLength = paragraph.length + (tail.length > 0 ? 2 : 0);
    if (tailBudget - chunkLength < 0) {
      break;
    }
    tail.unshift(paragraph);
    tailBudget -= chunkLength;
  }

  const omittedCount = Math.max(0, paragraphs.length - selected.length - tail.length);
  const compacted = [
    ...selected,
    omittedCount > 0 ? `[... ${omittedCount} middle paragraph${omittedCount === 1 ? '' : 's'} omitted ...]` : null,
    ...tail,
  ].filter(Boolean).join('\n\n');

  return {
    content: compacted.slice(0, MAX_SPRINT_SOURCE_CHARS),
    truncated: true,
    paragraphCount: paragraphs.length,
  };
}

function normalizeSprintCard(card: SprintCard): SprintCard {
  const bullets = Array.isArray(card.bullets) ? card.bullets.slice(0, 3) : [];
  const diagramPrompt = card.diagramPrompt ?? card.visualPrompt;

  return {
    ...card,
    bullets,
    diagramPrompt,
    visualPrompt: diagramPrompt,
    status: card.status ?? 'pending',
  };
}

export async function POST(req: Request) {
  const requestId = createGeminiDebugId('sprint');
  const startedAt = Date.now();
  try {
    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body. Expected { content: string }.' },
        { status: 400 }
      );
    }

    const content = typeof payload === 'object' && payload !== null && 'content' in payload
      ? (payload as { content?: unknown }).content
      : undefined;

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required as a non-empty string.' },
        { status: 400 }
      );
    }

    const compacted = compactSprintContent(content);

    logGeminiRequest('sprint', requestId, {
      contentLength: content.length,
      compactedLength: compacted.content.length,
      paragraphCount: compacted.paragraphCount,
      truncated: compacted.truncated,
      contentPreview: summarizeText(compacted.content, 500),
      model: 'gemini-2.5-flash',
    });

    const filledPrompt = SPRINT_PROMPT.replace('{{CONTENT}}', compacted.content);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: 'user', parts: [{ text: filledPrompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "";
    logGeminiResponse('sprint', requestId, Date.now() - startedAt, {
      responseLength: text.length,
      responsePreview: summarizeText(text, 500),
    });
    
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseError) {
      logGeminiError('sprint', requestId, parseError);
      return NextResponse.json(
        {
          error: 'Gemini returned an unreadable sprint payload.',
          requestId,
        },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        {
          error: 'Gemini returned an invalid sprint payload shape.',
          requestId,
        },
        { status: 502 }
      );
    }

    const sprintCards: SprintCard[] = parsed
      .filter((card): card is SprintCard => typeof card === 'object' && card !== null)
      .map(normalizeSprintCard);

    if (sprintCards.length === 0) {
      return NextResponse.json(
        {
          error: 'Gemini returned no valid sprint cards.',
          requestId,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(sprintCards);
  } catch (error) {
    logGeminiError('sprint', requestId, error);
    const message = error instanceof Error ? error.message : 'Failed to generate sprint cards';
    console.error('Sprint API Error:', error);
    return NextResponse.json(
      {
        error: message.includes('API key')
          ? 'Sprint generation is unavailable because Gemini is not configured.'
          : 'Failed to generate sprint cards.',
        requestId,
      },
      { status: 500 }
    );
  }
}
