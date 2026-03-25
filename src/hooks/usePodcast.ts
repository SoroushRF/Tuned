'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PodcastScript } from '@/types';

export type PodcastPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'finished' | 'error';

interface PodcastAudioResponse {
  audioBase64: string;
  mimeType: string;
  sampleRate: number;
  channels: number;
  speakerVoiceMap: Record<string, string>;
  segmentCount: number;
  wasShortened?: boolean;
}

export interface PodcastSentence {
  speaker: 'A' | 'B';
  text: string;
  segmentIndex: number;
  sentenceIndex: number;
  startFraction: number;
  endFraction: number;
}

const EMPTY_STATUS: PodcastPlaybackStatus = 'idle';

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function splitIntoSentences(text: string) {
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (matches || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function buildSentenceTimeline(script: PodcastScript) {
  const sentences: Array<Omit<PodcastSentence, 'startFraction' | 'endFraction'>> & {
    text: string;
  }[] = [];

  script.segments.forEach((segment, segmentIndex) => {
    const parts = splitIntoSentences(segment.text);
    if (parts.length === 0) {
      sentences.push({
        speaker: segment.speaker,
        text: segment.text.trim(),
        segmentIndex,
        sentenceIndex: 0,
      });
      return;
    }

    parts.forEach((sentence, sentenceIndex) => {
      sentences.push({
        speaker: segment.speaker,
        text: sentence,
        segmentIndex,
        sentenceIndex,
      });
    });
  });

  const weights = sentences.map((sentence) => Math.max(sentence.text.trim().length, 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0 || sentences.length === 0) {
    return [];
  }

  let cumulative = 0;
  return sentences.map((sentence, index) => {
    const startFraction = cumulative / total;
    cumulative += weights[index];
    const endFraction = cumulative / total;
    return {
      speaker: sentence.speaker,
      text: sentence.text,
      segmentIndex: sentence.segmentIndex,
      sentenceIndex: index,
      startFraction,
      endFraction,
    };
  });
}

function buildSegmentBoundariesFromTimeline(timeline: PodcastSentence[]) {
  if (timeline.length === 0) return [];
  const segmentLastFractions = new Map<number, number>();
  timeline.forEach((entry) => {
    segmentLastFractions.set(entry.segmentIndex, entry.endFraction);
  });

  return Array.from(segmentLastFractions.values());
}

function findSentenceIndex(fraction: number, timeline: PodcastSentence[]) {
  if (!timeline.length) return -1;
  for (let index = 0; index < timeline.length; index += 1) {
    if (fraction <= timeline[index].endFraction) {
      return index;
    }
  }
  return timeline.length - 1;
}

function findSegmentIndexFromSentence(sentenceIndex: number, timeline: PodcastSentence[]) {
  if (sentenceIndex < 0 || sentenceIndex >= timeline.length) return -1;
  return timeline[sentenceIndex].segmentIndex;
}

function findSentenceStartFraction(sentenceIndex: number, timeline: PodcastSentence[]) {
  if (sentenceIndex < 0 || sentenceIndex >= timeline.length) return 0;
  return timeline[sentenceIndex].startFraction;
}

function buildSentenceLabels(script: PodcastScript) {
  return buildSentenceTimeline(script);
}

function buildSentenceBoundaries(script: PodcastScript) {
  return buildSentenceTimeline(script).map((entry) => entry.endFraction);
}

function buildSegmentBoundaries(script: PodcastScript) {
  const timeline = buildSentenceTimeline(script);
  const boundaries = buildSegmentBoundariesFromTimeline(timeline);
  if (boundaries.length) {
    return boundaries;
  }

  const weights = script.segments.map((segment) => Math.max(segment.text.trim().length, 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0) {
    return [0];
  }

  let running = 0;
  return weights.map((weight) => {
    running += weight;
    return running / total;
  });
}

function findSegmentIndex(fraction: number, boundaries: number[]) {
  if (!boundaries.length) return -1;
  for (let index = 0; index < boundaries.length; index += 1) {
    if (fraction <= boundaries[index]) {
      return index;
    }
  }
  return boundaries.length - 1;
}

async function generatePodcastAudio(script: PodcastScript, signal?: AbortSignal) {
  const response = await fetch('/api/gemini/podcast/audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ script }),
    signal,
  });

  if (!response.ok) {
    let message = 'Failed to generate podcast audio.';
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Ignore JSON parse failures and use the default message.
    }
    throw new Error(message);
  }

  return (await response.json()) as PodcastAudioResponse;
}

export const usePodcast = (script?: PodcastScript) => {
  const [status, setStatus] = useState<PodcastPlaybackStatus>(EMPTY_STATUS);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wasShortened, setWasShortened] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const segmentBoundariesRef = useRef<number[]>([]);
  const sentenceTimelineRef = useRef<PodcastSentence[]>([]);
  const isMountedRef = useRef(true);
  const scriptKey = useMemo(() => JSON.stringify(script?.segments ?? []), [script]);
  const sentenceTimeline = useMemo(() => (script ? buildSentenceLabels(script) : []), [scriptKey]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onpause = null;
      audioRef.current.onplay = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    audioRef.current = null;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      cleanupAudio();
    };
  }, [cleanupAudio]);

  useEffect(() => {
    abortRef.current?.abort();
    cleanupAudio();
    setCurrentSegmentIndex(-1);
    setCurrentSentenceIndex(-1);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setWasShortened(false);
    setStatus(EMPTY_STATUS);

    if (!script || script.segments.length === 0) {
      return;
    }

    const abortController = new AbortController();
    abortRef.current = abortController;
    sentenceTimelineRef.current = sentenceTimeline;
    segmentBoundariesRef.current = buildSegmentBoundaries(script);

    const prepare = async () => {
      try {
        setStatus('loading');
        const audioData = await generatePodcastAudio(script, abortController.signal);

        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }

        setWasShortened(Boolean(audioData.wasShortened));

        const bytes = base64ToUint8Array(audioData.audioBase64);
        const blob = new Blob([bytes], { type: audioData.mimeType || 'audio/wav' });
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        audio.preload = 'auto';

        audio.onloadedmetadata = () => {
          if (!isMountedRef.current) return;
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
          setCurrentTime(audio.currentTime || 0);
          setStatus('idle');
          setProgress(0);
          setCurrentSegmentIndex(-1);
        };

        audio.ontimeupdate = () => {
          if (!isMountedRef.current) return;
          const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
          const fraction = duration > 0 ? audio.currentTime / duration : 0;
          const percent = Math.max(0, Math.min(100, fraction * 100));
          setCurrentTime(audio.currentTime || 0);
          setDuration(duration);
          setProgress(percent);
          const nextSentenceIndex = findSentenceIndex(fraction, sentenceTimelineRef.current);
          setCurrentSentenceIndex(nextSentenceIndex);
          setCurrentSegmentIndex(findSegmentIndexFromSentence(nextSentenceIndex, sentenceTimelineRef.current));
        };

        audio.onplay = () => {
          if (!isMountedRef.current) return;
          setStatus('playing');
          setError(null);
        };

        audio.onpause = () => {
          if (!isMountedRef.current) return;
          if (!audio.ended) {
            setStatus('paused');
          }
        };

        audio.onended = () => {
          if (!isMountedRef.current) return;
          setStatus('finished');
          setProgress(100);
          setCurrentTime(audio.duration || 0);
          setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
          setCurrentSentenceIndex(sentenceTimelineRef.current.length - 1);
          setCurrentSegmentIndex(script.segments.length - 1);
        };

        audio.onerror = () => {
          if (!isMountedRef.current) return;
          setStatus('error');
          setError('Podcast audio could not be played. Transcript-only mode is still available.');
        };

        cleanupAudio();
        audioUrlRef.current = objectUrl;
        audioRef.current = audio;
        setStatus('idle');
      } catch (err: any) {
        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }
        setStatus('error');
        setError(err?.message || 'Failed to generate podcast audio.');
      }
    };

    void prepare();

    return () => {
      abortController.abort();
    };
  }, [cleanupAudio, script, scriptKey]);

  const play = useCallback(async () => {
    if (!script || script.segments.length === 0) {
      setStatus('error');
      setError('No podcast segments are available yet.');
      return;
    }

    if (status === 'loading') {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      setStatus('error');
      setError('Podcast audio is not ready yet.');
      return;
    }

    if (status === 'finished') {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
    } catch {
      setStatus('error');
      setError('Playback failed. Please try again.');
    }
  }, [script, status]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setStatus(audioRef.current ? 'idle' : EMPTY_STATUS);
    setCurrentSegmentIndex(-1);
    setCurrentSentenceIndex(-1);
    setProgress(0);
    setCurrentTime(0);
    setError(null);
  }, []);

  const restart = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      setStatus('error');
      setError('Podcast audio is not ready yet.');
      return;
    }

    audio.currentTime = 0;
    setCurrentSegmentIndex(-1);
    setCurrentSentenceIndex(-1);
    setProgress(0);
    setCurrentTime(0);
    setStatus('idle');

    try {
      await audio.play();
    } catch {
      setStatus('error');
      setError('Playback failed. Please try again.');
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (status === 'playing') {
      pause();
      return;
    }

    void play();
  }, [pause, play, status]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;

    const nextTime = Math.max(0, Math.min(duration || audio.duration || 0, seconds));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);

    const totalDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
    if (totalDuration > 0) {
      const fraction = nextTime / totalDuration;
      setProgress(Math.max(0, Math.min(100, fraction * 100)));
      const nextSentenceIndex = findSentenceIndex(fraction, sentenceTimelineRef.current);
      setCurrentSentenceIndex(nextSentenceIndex);
      setCurrentSegmentIndex(findSegmentIndexFromSentence(nextSentenceIndex, sentenceTimelineRef.current));
    }
  }, [duration]);

  const skipBy = useCallback((deltaSeconds: number) => {
    seekTo((audioRef.current?.currentTime || 0) + deltaSeconds);
  }, [seekTo]);

  const seekToSentence = useCallback((sentenceIndex: number) => {
    const audio = audioRef.current;
    const timeline = sentenceTimelineRef.current;
    if (!audio || !timeline.length || sentenceIndex < 0 || sentenceIndex >= timeline.length) return;

    const startFraction = findSentenceStartFraction(sentenceIndex, timeline);
    seekTo(startFraction * (duration || audio.duration || 0));
  }, [duration, seekTo]);

  return {
    status,
    currentSegmentIndex,
    currentSentenceIndex,
    progress,
    currentTime,
    duration,
    error,
    wasShortened,
    sentenceTimeline,
    play,
    pause,
    togglePlayback,
    restart,
    stop,
    seekTo,
    skipBy,
    seekToSentence,
  };
};
