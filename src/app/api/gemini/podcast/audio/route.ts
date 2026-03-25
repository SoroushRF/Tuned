import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PodcastScript } from '@/types';
import {
  createGeminiDebugId,
  logGeminiError,
  logGeminiRequest,
  logGeminiResponse,
  summarizeText,
} from '@/lib/gemini/debug';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';
const SAMPLE_RATE = 24000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const AUDIO_MAX_SEGMENTS = 4;
const AUDIO_MAX_WORDS = 160;

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

function trimPodcastScript(script: PodcastScript) {
  let remainingWords = AUDIO_MAX_WORDS;
  let wasShortened = Boolean(script.isShortened);
  const segments: PodcastScript['segments'] = [];

  for (const segment of script.segments) {
    if (segments.length >= AUDIO_MAX_SEGMENTS || remainingWords <= 0) {
      wasShortened = true;
      break;
    }

    const words = segment.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      continue;
    }

    const limit = Math.min(words.length, remainingWords);
    if (limit < words.length) {
      wasShortened = true;
    }

    const trimmedText = words.slice(0, limit).join(' ');
    segments.push({
      speaker: segment.speaker,
      text: limit < words.length ? `${trimmedText}...` : trimmedText,
    });

    remainingWords -= limit;
  }

  if (script.segments.length > segments.length) {
    wasShortened = true;
  }

  return {
    ...script,
    segments: segments.length > 0 ? segments : script.segments.slice(0, 1),
    wasShortened,
    targetDurationSeconds: wasShortened ? 60 : script.targetDurationSeconds,
  };
}

export async function POST(req: NextRequest) {
  const requestId = createGeminiDebugId('podcast_audio');
  const startedAt = Date.now();
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body. Expected { script }.' },
        { status: 400 }
      );
    }

    const { script } = body as { script?: PodcastScript };

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

    const shortenedScript = trimPodcastScript(script);
    const transcript = buildTranscript(shortenedScript);
    const transcriptWordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

    logGeminiRequest('podcast_audio', requestId, {
      model: AUDIO_MODEL,
      originalSegmentCount: script.segments.length,
      shortenedSegmentCount: shortenedScript.segments.length,
      originalWordCount: script.segments
        .map((segment) => segment.text)
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
      transcriptWordCount,
      wasShortened: shortenedScript.wasShortened,
      transcriptPreview: summarizeText(transcript, 500),
    });

    const generatePodcastAudio = async (useMultiSpeakerVoices: boolean) => {
      return ai.models.generateContent({
        model: AUDIO_MODEL,
        contents: [{
          parts: [{
            text: [
              'Read this as a calm, NotebookLM-style academic podcast.',
              'Keep the transcript order exactly as written.',
              'Do not summarize, add commentary, or skip lines.',
              useMultiSpeakerVoices
                ? 'Speaker A and Speaker B should sound distinct and balanced.'
                : 'Read the transcript naturally.',
              '',
              transcript,
            ].join('\n'),
          }],
        }],
        config: {
          responseModalities: ['AUDIO'],
          ...(useMultiSpeakerVoices
            ? {
                speechConfig: {
                  multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                      {
                        speaker: 'A',
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
                      },
                      {
                        speaker: 'B',
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Rasalgethi' } },
                      },
                    ],
                  },
                },
              }
            : {}),
        },
      });
    };

    let response;
    try {
      response = await generatePodcastAudio(true);
    } catch {
      // If voice config causes internal errors, retry with default (single) voices.
      response = await generatePodcastAudio(false);
    }

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioBase64) {
      throw new Error('Gemini did not return audio data.');
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = pcmToWavBuffer(pcmBuffer);

    logGeminiResponse('podcast_audio', requestId, Date.now() - startedAt, {
      audioBase64Length: audioBase64.length,
      wavByteLength: wavBuffer.length,
      wasShortened: shortenedScript.wasShortened,
      segmentCount: shortenedScript.segments.length,
    });

    return NextResponse.json({
      audioBase64: wavBuffer.toString('base64'),
      mimeType: 'audio/wav',
      sampleRate: SAMPLE_RATE,
      channels: CHANNELS,
      wasShortened: shortenedScript.wasShortened,
      speakerVoiceMap: {
        A: 'Charon',
        B: 'Rasalgethi',
      },
      segmentCount: shortenedScript.segments.length,
    });
  } catch (error: unknown) {
    logGeminiError('podcast_audio', requestId, error);
    console.error('Podcast Audio API Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate podcast audio.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
