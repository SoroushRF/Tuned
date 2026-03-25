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
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    logGeminiRequest('sprint', requestId, {
      contentLength: content.length,
      contentPreview: summarizeText(content, 500),
      model: 'gemini-2.5-flash',
    });

    const filledPrompt = SPRINT_PROMPT.replace('{{CONTENT}}', content);

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
    
    const parsed = JSON.parse(cleanedJson);
    if (!Array.isArray(parsed)) {
      throw new Error('Sprint API returned a non-array payload');
    }

    const sprintCards: SprintCard[] = parsed.map(normalizeSprintCard);

    return NextResponse.json(sprintCards);
  } catch (error) {
    logGeminiError('sprint', requestId, error);
    console.error('Sprint API Error:', error);
    return NextResponse.json({ error: 'Failed to generate sprint cards' }, { status: 500 });
  }
}
