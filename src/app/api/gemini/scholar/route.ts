import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SCHOLAR_PROMPT } from '@/prompts/scholar';
import { ScholarContent } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const filledPrompt = SCHOLAR_PROMPT.replace('{{CONTENT}}', content);

    const result = await model.generateContent(filledPrompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const scholarContent: ScholarContent = JSON.parse(cleanedJson);

    return NextResponse.json(scholarContent);
  } catch (error) {
    console.error('Scholar API Error:', error);
    return NextResponse.json({ error: 'Failed to generate scholar content' }, { status: 500 });
  }
}
