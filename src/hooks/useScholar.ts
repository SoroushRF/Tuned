'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScholarChunk, ScholarContent, NeuroPrintVector } from '@/types';
import { useAppContext } from '@/store/context';
import { logScholarDebug } from '@/lib/scholar/debug';

export type ScholarViewMode = 'split' | 'focus';

interface UseScholarOptions {
  initialChunkIndex?: number;
}

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
};

const uniqueStrings = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const buildFallbackChunk = (content: ScholarContent): ScholarChunk => ({
  chunkId: 'chunk-1',
  sourceLabel: content.sourceLabels?.[0] || 'Combined Material',
  pageLabel: 'Chunk 1',
  originalText: content.originalText || '',
  simplifiedText: content.simplifiedText || '',
  summary: 'Fallback reading block.',
  highlightedTerms: content.highlightedTerms || content.keyTerms.map((term) => term.term),
  keyTerms: content.keyTerms,
});

const getChunks = (content: ScholarContent) => {
  if (Array.isArray(content.chunks) && content.chunks.length > 0) {
    return content.chunks;
  }
  return [buildFallbackChunk(content)];
};

const applyScholarDelta = (vector: NeuroPrintVector, delta: Partial<NeuroPrintVector>) => ({
  ...vector,
  audio: Math.max(0, Math.min(1, vector.audio + (delta.audio ?? 0))),
  adhd: Math.max(0, Math.min(1, vector.adhd + (delta.adhd ?? 0))),
  scholar: Math.max(0, Math.min(1, vector.scholar + (delta.scholar ?? 0))),
  lastUpdated: Date.now(),
});

export const useScholar = (content: ScholarContent, options: UseScholarOptions = {}) => {
  const { state, dispatch } = useAppContext();
  const chunks = useMemo(() => getChunks(content), [content]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(() => clampIndex(options.initialChunkIndex ?? 0, chunks.length));
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ScholarViewMode>('split');
  const [readingDepth, setReadingDepth] = useState(0.72);
  const changeCounts = useRef({ readingDepth: 0 });
  const lastState = useRef({
    chunkIndex: -1,
    activeTerm: '',
    viewMode: '' as ScholarViewMode | '',
    readingDepth: -1,
  });

  useEffect(() => {
    setActiveChunkIndex((prev) => clampIndex(prev, chunks.length));
  }, [chunks.length]);

  const activeChunk = chunks[activeChunkIndex] || chunks[0] || buildFallbackChunk(content);

  useEffect(() => {
    const nextState = {
      chunkIndex: activeChunkIndex,
      activeTerm: activeTerm || '',
      viewMode,
      readingDepth,
    };

    const previous = lastState.current;
    const hasChanged =
      previous.chunkIndex !== nextState.chunkIndex ||
      previous.activeTerm !== nextState.activeTerm ||
      previous.viewMode !== nextState.viewMode ||
      previous.readingDepth !== nextState.readingDepth;

    if (hasChanged) {
      logScholarDebug('state', {
        activeChunkIndex,
        activeChunkLabel: activeChunk?.pageLabel,
        activeTerm: activeTerm || null,
        viewMode,
        readingDepth,
        totalChunks: chunks.length,
      });

      lastState.current = nextState;
    }
  }, [activeChunk?.pageLabel, activeChunkIndex, activeTerm, chunks.length, readingDepth, viewMode]);

  const keyTerms = useMemo(() => {
    return uniqueStrings([
      ...content.keyTerms.map((term) => term.term),
      ...(content.highlightedTerms || []),
      ...(activeChunk?.highlightedTerms || []),
    ]);
  }, [activeChunk?.highlightedTerms, content.highlightedTerms, content.keyTerms]);

  const selectedTermMeta = useMemo(() => {
    const lower = activeTerm?.toLowerCase();
    if (!lower) return null;

    const pool = [
      ...content.keyTerms,
      ...(activeChunk?.keyTerms || []),
    ];

    return pool.find((term) => term.term.toLowerCase() === lower) || null;
  }, [activeChunk?.keyTerms, activeTerm, content.keyTerms]);

  const advanceChunk = useCallback(() => {
    logScholarDebug('advance_chunk', { from: activeChunkIndex });
    setActiveTerm(null);
    setActiveChunkIndex((prev) => Math.min(prev + 1, chunks.length - 1));
  }, [activeChunkIndex, chunks.length]);

  const prevChunk = useCallback(() => {
    logScholarDebug('prev_chunk', { from: activeChunkIndex });
    setActiveTerm(null);
    setActiveChunkIndex((prev) => Math.max(prev - 1, 0));
  }, [activeChunkIndex]);

  const goToChunk = useCallback((index: number) => {
    logScholarDebug('go_to_chunk', { from: activeChunkIndex, to: index });
    setActiveTerm(null);
    setActiveChunkIndex(clampIndex(index, chunks.length));
  }, [activeChunkIndex, chunks.length]);

  const selectTerm = useCallback((term: string | null) => {
    logScholarDebug('select_term', { term });
    setActiveTerm(term);
  }, []);

  const adjustReadingDepth = useCallback((nextDepth: number) => {
    const clamped = Math.min(1, Math.max(0, nextDepth));
    logScholarDebug('adjust_reading_depth', { from: readingDepth, to: clamped });
    setReadingDepth(clamped);
    changeCounts.current.readingDepth += 1;

    if (changeCounts.current.readingDepth >= 2) {
      const scholarBoost = clamped > 0.55 ? 0.04 : -0.03;
      const nextVector = applyScholarDelta(state.neuroPrint, { scholar: scholarBoost });
      if (nextVector !== state.neuroPrint) {
        dispatch({ type: 'SET_NEUROPRINT', payload: nextVector });
      }
      changeCounts.current.readingDepth = 0;
    }
  }, [dispatch, readingDepth, state.neuroPrint]);

  const toggleView = useCallback(() => {
    logScholarDebug('toggle_view', { from: viewMode });
    setViewMode((prev) => (prev === 'split' ? 'focus' : 'split'));
  }, [viewMode]);

  return {
    content,
    chunks,
    activeChunk,
    activeChunkIndex,
    activeTerm,
    selectedTermMeta,
    selectTerm,
    viewMode,
    setViewMode,
    toggleView,
    readingDepth,
    setReadingDepth: adjustReadingDepth,
    advanceChunk,
    prevChunk,
    goToChunk,
    keyTerms,
    hasChunks: chunks.length > 0,
    totalChunks: chunks.length,
    isFirstChunk: activeChunkIndex === 0,
    isLastChunk: activeChunkIndex === chunks.length - 1,
  };
};
