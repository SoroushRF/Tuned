import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_FAST_MODEL } from "@/lib/gemini/models";
import { QUIZ_GEN_PROMPT } from '@/prompts/quiz';
import { QuizQuestion } from '@/types';
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from '@/lib/gemini/debug';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  const requestId = createGeminiDebugId('quiz');
  const startedAt = Date.now();
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    logGeminiRequest('quiz', requestId, {
      contentLength: content.length,
      contentPreview: summarizeText(content, 500),
      model: GEMINI_FAST_MODEL,
    });

    const filledPrompt = QUIZ_GEN_PROMPT.replace('{{CONTENT}}', content);

    const response = await ai.models.generateContent({
      model: GEMINI_FAST_MODEL, 
      contents: [{ role: 'user', parts: [{ text: filledPrompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "";
    logGeminiResponse('quiz', requestId, Date.now() - startedAt, {
      responseLength: text.length,
      responsePreview: summarizeText(text, 500),
    });
    
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const questions: QuizQuestion[] = JSON.parse(cleanedJson);

    return NextResponse.json(questions);
  } catch (error) {
    logGeminiError('quiz', requestId, error);
    console.error('Quiz API Error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
  }
}
