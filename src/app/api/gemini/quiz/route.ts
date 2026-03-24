import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QUIZ_GEN_PROMPT } from '@/prompts/quiz';
import { QuizQuestion } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const filledPrompt = QUIZ_GEN_PROMPT.replace('{{CONTENT}}', content);

    const result = await model.generateContent(filledPrompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const questions: QuizQuestion[] = JSON.parse(cleanedJson);

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Quiz API Error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
  }
}
