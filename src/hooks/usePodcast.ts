'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PodcastScript } from '@/types';

/**
 * Parsa - Podcast Playback Hook
 * Manages the playback state and Web Speech API integration for dual voices.
 */
export const usePodcast = (script?: PodcastScript) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((index: number) => {
    if (!script || !synthRef.current || index >= script.segments.length) {
      setIsPlaying(false);
      setCurrentSegmentIndex(-1);
      return;
    }

    const segment = script.segments[index];
    const utterance = new SpeechSynthesisUtterance(segment.text);
    
    // Select voices (A = Female/Alto, B = Male/Baritone)
    const voices = synthRef.current.getVoices();
    if (segment.speaker === 'A') {
      utterance.voice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || voices[0];
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    } else {
      utterance.voice = voices.find(v => v.name.includes('Google') && v.name.includes('Male')) || voices[1];
      utterance.pitch = 0.9;
      utterance.rate = 1.02;
    }

    utterance.onstart = () => {
      setCurrentSegmentIndex(index);
      setProgress(((index + 1) / script.segments.length) * 100);
    };

    utterance.onend = () => {
      if (isPlaying) {
        speak(index + 1);
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [script, isPlaying]);

  const togglePlayback = useCallback(() => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        speak(currentSegmentIndex === -1 ? 0 : currentSegmentIndex);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, speak, currentSegmentIndex]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentSegmentIndex(-1);
    setProgress(0);
  }, []);

  return {
    isPlaying,
    currentSegmentIndex,
    progress,
    togglePlayback,
    stop
  };
};
