'use client';

import React, { useEffect, useMemo } from 'react';
import { ScholarContent } from '@/types';
import { useScholar } from '@/hooks/useScholar';

interface ScholarPanelProps {
  content: ScholarContent;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const uniqueStrings = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const splitSentences = (text: string) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const limitTextByDepth = (text: string, depth: number) => {
  const normalized = text.trim();
  if (!normalized) return '';

  if (depth >= 0.8) return normalized;

  const sentences = splitSentences(normalized);
  if (sentences.length === 0) return normalized;

  const targetSentences = depth >= 0.6 ? 3 : depth >= 0.4 ? 2 : 1;
  return `${sentences.slice(0, targetSentences).join(' ')}${sentences.length > targetSentences ? ' ...' : ''}`;
};

const termScore = (term: { term: string; definition: string; examRelevance: string }) =>
  term.definition.length + term.examRelevance.length + term.term.length;

const inputLikeSelector = 'input, textarea, select, [contenteditable="true"]';

function highlightText(
  text: string,
  terms: string[],
  activeTerm: string | null,
  onPickTerm: (term: string) => void,
) {
  const cleanedTerms = uniqueStrings(terms).sort((a, b) => b.length - a.length);
  if (cleanedTerms.length === 0 || !text.trim()) {
    return text;
  }

  const regex = new RegExp(`(${cleanedTerms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const match = cleanedTerms.find((term) => term.toLowerCase() === part.toLowerCase());
    if (!match) {
      return <React.Fragment key={`${index}-${part}`}>{part}</React.Fragment>;
    }

    const isActive = activeTerm?.toLowerCase() === match.toLowerCase();
    return (
      <button
        key={`${index}-${part}`}
        type="button"
        onClick={() => onPickTerm(match)}
        className={[
          'inline rounded-md border px-1.5 py-0.5 align-baseline text-left font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          isActive
            ? 'border-primary/35 bg-primary/15 text-foreground'
            : 'border-primary/15 bg-primary/[0.04] text-foreground/95 hover:bg-primary/[0.08]',
        ].join(' ')}
      >
        {part}
      </button>
    );
  });
}

export default function ScholarPanel({ content }: ScholarPanelProps) {
  const scholar = useScholar(content);

  const activeChunk = scholar.activeChunk;
  const sourceTerms = useMemo(() => {
    return uniqueStrings([
      ...scholar.keyTerms,
      ...(activeChunk?.highlightedTerms || []),
      ...(content.highlightedTerms || []),
    ]);
  }, [activeChunk?.highlightedTerms, content.highlightedTerms, scholar.keyTerms]);

  const activeTermMeta = useMemo(() => {
    if (!scholar.activeTerm) return null;
    const lower = scholar.activeTerm.toLowerCase();
    return [
      ...content.keyTerms,
      ...(activeChunk?.keyTerms || []),
    ].find((term) => term.term.toLowerCase() === lower) || null;
  }, [activeChunk?.keyTerms, content.keyTerms, scholar.activeTerm]);

  const displayedOriginal = useMemo(() => {
    const text = limitTextByDepth(activeChunk.originalText, scholar.readingDepth);
    return highlightText(text, sourceTerms, scholar.activeTerm, scholar.selectTerm);
  }, [activeChunk.originalText, scholar.activeTerm, scholar.readingDepth, scholar.selectTerm, sourceTerms]);

  const displayedSimplified = useMemo(() => {
    const text = limitTextByDepth(activeChunk.simplifiedText, scholar.readingDepth);
    return highlightText(text, sourceTerms, scholar.activeTerm, scholar.selectTerm);
  }, [activeChunk.simplifiedText, scholar.activeTerm, scholar.readingDepth, scholar.selectTerm, sourceTerms]);

  const topKeyTerms = useMemo(() => {
    return [...content.keyTerms]
      .sort((a, b) => termScore(b) - termScore(a))
      .slice(0, 4);
  }, [content.keyTerms]);

  const chunkSummary = activeChunk.summary || 'No summary was provided for this chunk.';
  const coreIdeas = activeChunk.keyTerms.slice(0, 3);
  const readingDepthLabel =
    scholar.readingDepth >= 0.8 ? 'Full detail' :
    scholar.readingDepth >= 0.6 ? 'Balanced' :
    scholar.readingDepth >= 0.4 ? 'Concise' : 'Very compact';

  const statusMessage = useMemo(() => {
    const term = scholar.activeTerm ? `Focused term: ${scholar.activeTerm}.` : 'No term selected.';
    return `Chunk ${scholar.activeChunkIndex + 1} of ${scholar.totalChunks}. ${term} Reading depth at ${Math.round(scholar.readingDepth * 100)} percent.`;
  }, [scholar.activeChunkIndex, scholar.activeTerm, scholar.readingDepth, scholar.totalChunks]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target && target.matches(inputLikeSelector)) return;

      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        scholar.prevChunk();
        return;
      }

      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        scholar.advanceChunk();
        return;
      }

      if (key === 'escape') {
        event.preventDefault();
        scholar.selectTerm(null);
        return;
      }

      if (key === 's') {
        event.preventDefault();
        scholar.setViewMode('split');
        return;
      }

      if (key === 'f') {
        event.preventDefault();
        scholar.setViewMode('focus');
        return;
      }

      if (key === 'q') {
        event.preventDefault();
        scholar.toggleView();
        return;
      }

      if (key === '[') {
        event.preventDefault();
        scholar.setReadingDepth(scholar.readingDepth - 0.1);
        return;
      }

      if (key === ']') {
        event.preventDefault();
        scholar.setReadingDepth(scholar.readingDepth + 0.1);
        return;
      }

      if (['1', '2', '3', '4'].includes(key)) {
        const index = Number(key) - 1;
        const term = sourceTerms[index];
        if (term) {
          event.preventDefault();
          scholar.selectTerm(term);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    scholar,
    sourceTerms,
  ]);

  return (
    <div className="flex h-full flex-col gap-8 animate-fade-in-up duration-1000 max-w-7xl mx-auto py-10 px-6 md:px-10">
      <p className="sr-only" aria-live="polite">{statusMessage}</p>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.55em] text-primary/55">Scholar Mode</p>
          <h3 className="text-3xl md:text-5xl font-black tracking-tightest uppercase leading-none">Side-by-side reading</h3>
          <p className="max-w-2xl text-sm md:text-base font-medium leading-relaxed text-muted-foreground">
            Read the original material, inspect the simplified rewrite, and tap jargon to see a definition without losing your place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-border/30 bg-card p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => scholar.setViewMode('split')}
              className={[
                'rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                scholar.viewMode === 'split' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => scholar.setViewMode('focus')}
              className={[
                'rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                scholar.viewMode === 'focus' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              Focus View
            </button>
          </div>

          <button
            type="button"
            onClick={scholar.toggleView}
            className="rounded-full border border-border/25 bg-card px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground transition-all hover:text-foreground hover:border-border/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Toggle layout
          </button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border/25 bg-card/70 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={scholar.prevChunk}
              disabled={scholar.isFirstChunk}
              className="rounded-full border border-border/25 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back
            </button>
            <button
              type="button"
              onClick={scholar.advanceChunk}
              disabled={scholar.isLastChunk}
              className="rounded-full border border-border/25 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Next
            </button>
            {scholar.chunks.map((chunk, index) => (
              <button
                key={chunk.chunkId}
                type="button"
                onClick={() => scholar.goToChunk(index)}
                className={[
                  'rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  index === scholar.activeChunkIndex
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border/25 bg-background text-muted-foreground hover:text-foreground hover:border-border/45',
                ].join(' ')}
              >
                {chunk.pageLabel}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">
              {activeChunk.sourceLabel}
            </p>
            <span className="rounded-full border border-border/20 bg-background px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              {scholar.activeChunkIndex + 1} / {scholar.totalChunks}
            </span>
            <span className="rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              {readingDepthLabel}
            </span>
          </div>
        </div>
      </div>

      <div className={[
        'grid min-h-0 gap-6',
        scholar.viewMode === 'focus' ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]' : 'grid-cols-1 xl:grid-cols-2',
      ].join(' ')}>
        <section className="flex min-h-0 flex-col rounded-[2rem] border border-border/25 bg-secondary/[0.05] p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/45">Original</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{activeChunk.pageLabel}</p>
            </div>
            <span className="rounded-full border border-border/20 bg-background px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Source text
            </span>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto custom-scrollbar rounded-[1.5rem] border border-border/20 bg-background/75 p-5 md:p-7 text-[15px] md:text-base leading-8 text-foreground/90">
            {displayedOriginal}
          </div>
        </section>

        <section className="flex min-h-0 flex-col rounded-[2rem] border border-primary/15 bg-card p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">Simplified</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{chunkSummary}</p>
            </div>
            <span className="rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              Guided view
            </span>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto custom-scrollbar rounded-[1.5rem] border border-primary/10 bg-primary/[0.03] p-5 md:p-7 text-[16px] md:text-lg leading-8 font-medium text-foreground">
            {displayedSimplified}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/20 bg-background p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Reading depth</p>
              <p className="mt-2 text-xl font-black tracking-tightest">{readingDepthLabel}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Lower values show a lighter rewrite. Higher values keep more detail in view.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/20 bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Depth control</p>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/55">
                  {Math.round(scholar.readingDepth * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={scholar.readingDepth}
                onChange={(event) => scholar.setReadingDepth(parseFloat(event.target.value))}
                className="mt-4 w-full accent-primary"
                aria-label="Reading depth"
              />
            </div>
          </div>
        </section>

        {scholar.viewMode === 'focus' && (
          <aside className="flex min-h-0 flex-col rounded-[2rem] border border-border/25 bg-card/80 p-5 md:p-6 shadow-sm xl:col-start-2">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/45">Term Focus</p>
            <h4 className="mt-3 text-2xl font-black tracking-tightest">Tap a difficult term</h4>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Scholar highlights technical phrases and difficult words so you can inspect them without leaving the current chunk.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {sourceTerms.length > 0 ? sourceTerms.map((term) => {
                const isActive = scholar.activeTerm?.toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => scholar.selectTerm(term)}
                    className={[
                      'rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isActive
                        ? 'border-primary/20 bg-primary/10 text-primary'
                        : 'border-border/25 bg-background text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {term}
                  </button>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No highlighted terms were returned for this chunk.</p>
              )}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-border/20 bg-background p-4 md:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Selected term</p>
              {scholar.activeTerm ? (
                <div className="mt-3 space-y-3">
                  <h5 className="text-xl font-black tracking-tightest">{scholar.activeTerm}</h5>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {activeTermMeta?.definition || 'No definition was provided for this term.'}
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
                    {activeTermMeta?.examRelevance || 'No exam relevance note was provided.'}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Click a highlighted word in the reading pane or select a term from the list.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-border/20 bg-card px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Core idea</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            {activeChunk.summary || 'This chunk is building the core idea for the current section.'}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/20 bg-card px-5 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Key takeaways</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {coreIdeas.length > 0 ? coreIdeas.map((term) => (
              <button
                key={term.term}
                type="button"
                onClick={() => scholar.selectTerm(term.term)}
                className="rounded-full border border-primary/15 bg-primary/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {term.term}
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">No takeaways were extracted for this chunk.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topKeyTerms.map((term) => (
          <button
            key={term.term}
            type="button"
            onClick={() => scholar.selectTerm(term.term)}
            className="rounded-[1.5rem] border border-border/20 bg-card px-5 py-4 text-left shadow-sm transition-all hover:border-primary/20 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between gap-4">
              <h5 className="text-sm font-black uppercase tracking-[0.35em] text-foreground/90">{term.term}</h5>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/55">Key term</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{term.definition}</p>
            <p className="mt-3 text-xs leading-relaxed text-primary/60">{term.examRelevance}</p>
          </button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-border/20 bg-card/60 px-5 py-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">Keyboard</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Left / A: previous chunk · Right / D: next chunk · S: split view · F: focus view · Q: toggle layout · [ / ]: reading depth · 1-4: select a key term · Escape: clear term
        </p>
      </div>
    </div>
  );
}
