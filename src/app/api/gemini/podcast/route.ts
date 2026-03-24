import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PODCAST_PROMPT } from '@/prompts/podcast';
import { PodcastScript } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const filledPrompt = PODCAST_PROMPT.replace('{{CONTENT}}', content);

    const result = await model.generateContent(filledPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to extract JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    
    const podcastScript: PodcastScript = JSON.parse(cleanedJson);

    return NextResponse.json(podcastScript);
  } catch (error) {
    console.error('Podcast API Error:', error);
    return NextResponse.json({ error: 'Failed to generate podcast script' }, { status: 500 });
  }
}
