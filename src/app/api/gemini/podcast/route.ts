import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_FAST_MODEL } from "@/lib/gemini/models";
import { PODCAST_PROMPT } from '@/prompts/podcast';
import { PodcastScript } from '@/types';
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from '@/lib/gemini/debug';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  const requestId = createGeminiDebugId('podcast');
  const startedAt = Date.now();
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    logGeminiRequest('podcast', requestId, {
      contentLength: content.length,
      contentPreview: summarizeText(content, 500),
      model: GEMINI_FAST_MODEL,
    });

    const filledPrompt = PODCAST_PROMPT.replace('{{CONTENT}}', content);

    const response = await ai.models.generateContent({
      model: GEMINI_FAST_MODEL, 
      contents: [{ role: 'user', parts: [{ text: filledPrompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "";
    logGeminiResponse('podcast', requestId, Date.now() - startedAt, {
      responseLength: text.length,
      responsePreview: summarizeText(text, 500),
    });
    
    // Attempt to extract JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const podcastScript: PodcastScript = JSON.parse(cleanedJson);

    return NextResponse.json(podcastScript);
  } catch (error) {
    logGeminiError('podcast', requestId, error);
    console.error('Podcast API Error:', error);
    return NextResponse.json({ error: 'Failed to generate podcast script' }, { status: 500 });
  }
}
