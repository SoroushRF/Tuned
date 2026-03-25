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

function buildSegmentBoundaries(script: PodcastScript) {
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const segmentBoundariesRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);
  const scriptKey = useMemo(() => JSON.stringify(script?.segments ?? []), [script]);

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
    setProgress(0);
    setError(null);
    setStatus(EMPTY_STATUS);

    if (!script || script.segments.length === 0) {
      return;
    }

    const abortController = new AbortController();
    abortRef.current = abortController;
    segmentBoundariesRef.current = buildSegmentBoundaries(script);

    const prepare = async () => {
      try {
        setStatus('loading');
        const audioData = await generatePodcastAudio(script, abortController.signal);

        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }

        const bytes = base64ToUint8Array(audioData.audioBase64);
        const blob = new Blob([bytes], { type: audioData.mimeType || 'audio/wav' });
        const objectUrl = URL.createObjectURL(blob);
        const audio = new Audio(objectUrl);
        audio.preload = 'auto';

        audio.onloadedmetadata = () => {
          if (!isMountedRef.current) return;
          setStatus('idle');
          setProgress(0);
          setCurrentSegmentIndex(-1);
        };

        audio.ontimeupdate = () => {
          if (!isMountedRef.current) return;
          const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
          const fraction = duration > 0 ? audio.currentTime / duration : 0;
          const percent = Math.max(0, Math.min(100, fraction * 100));
          setProgress(percent);
          setCurrentSegmentIndex(findSegmentIndex(fraction, segmentBoundariesRef.current));
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
    setProgress(0);
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
    setProgress(0);
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

  return {
    status,
    currentSegmentIndex,
    progress,
    error,
    play,
    pause,
    togglePlayback,
    restart,
    stop,
  };
};
