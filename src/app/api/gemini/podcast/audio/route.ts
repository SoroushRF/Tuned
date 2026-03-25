import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PodcastScript } from '@/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';
const SAMPLE_RATE = 24000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function pcmToWavBuffer(pcm: Buffer, channels = CHANNELS, sampleRate = SAMPLE_RATE, bitsPerSample = BITS_PER_SAMPLE) {
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

function buildTranscript(script: PodcastScript) {
  return script.segments
    .map((segment) => `${segment.speaker}: ${segment.text}`)
    .join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const { script } = (await req.json()) as { script?: PodcastScript };

    if (!script || !Array.isArray(script.segments) || script.segments.length === 0) {
      return NextResponse.json({ error: 'Podcast transcript is required.' }, { status: 400 });
    }

    const speakers = new Set(script.segments.map((segment) => segment.speaker));
    if (speakers.size > 2) {
      return NextResponse.json(
        { error: 'Podcast audio currently supports up to two speakers.' },
        { status: 400 }
      );
    }

    const transcript = buildTranscript(script);

    const response = await ai.models.generateContent({
      model: AUDIO_MODEL,
      contents: [{
        parts: [{
          text: [
            'Read this as a calm, NotebookLM-style academic podcast.',
            'Keep the transcript order exactly as written.',
            'Do not summarize, add commentary, or skip lines.',
            'Speaker A and Speaker B should sound distinct and balanced.',
            '',
            transcript,
          ].join('\n'),
        }],
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'A',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
              {
                speaker: 'B',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Puck' },
                },
              },
            ],
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      throw new Error('Gemini did not return audio data.');
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = pcmToWavBuffer(pcmBuffer);

    return NextResponse.json({
      audioBase64: wavBuffer.toString('base64'),
      mimeType: 'audio/wav',
      sampleRate: SAMPLE_RATE,
      channels: CHANNELS,
      speakerVoiceMap: {
        A: 'Kore',
        B: 'Puck',
      },
      segmentCount: script.segments.length,
    });
  } catch (error: any) {
    console.error('Podcast Audio API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate podcast audio.' },
      { status: 500 }
    );
  }
}
