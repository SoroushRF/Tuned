import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SPRINT_PROMPT } from '@/prompts/sprint';
import { SprintCard } from '@/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const filledPrompt = SPRINT_PROMPT.replace('{{CONTENT}}', content);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: 'user', parts: [{ text: filledPrompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "";
    
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const sprintCards: SprintCard[] = JSON.parse(cleanedJson);

    return NextResponse.json(sprintCards);
  } catch (error) {
    console.error('Sprint API Error:', error);
    return NextResponse.json({ error: 'Failed to generate sprint cards' }, { status: 500 });
  }
}
