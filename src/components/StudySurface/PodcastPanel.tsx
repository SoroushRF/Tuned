'use client';

import React from 'react';
import { PodcastScript } from '@/types';
import { usePodcast } from '@/hooks/usePodcast';

interface PodcastPanelProps {
  script: PodcastScript;
}

export default function PodcastPanel({ script }: PodcastPanelProps) {
  const {
    status,
    currentSegmentIndex,
    progress,
    error,
    togglePlayback,
    restart,
    stop,
  } = usePodcast(script);

  const hasTranscript = script.segments.length > 0;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const statusLabel = (() => {
    switch (status) {
      case 'loading':
        return 'Generating audio';
      case 'playing':
        return 'Playing';
      case 'paused':
        return 'Paused';
      case 'finished':
        return 'Complete';
      case 'error':
        return 'Transcript only';
      default:
        return 'Ready';
    }
  })();

  return (
    <div className="flex flex-col lg:flex-row h-full animate-fade-in-up">
      <aside className="w-full lg:w-80 p-10 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r border-border/20 bg-secondary/10">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/50">
            Podcast Playback
          </p>
          <h3 className="text-2xl font-black tracking-tight text-foreground">
            Generated Podcast
          </h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            Gemini turns the transcript into a real two-voice audio segment.
          </p>
        </div>

        <div className="rounded-[2rem] border border-border/30 bg-card/70 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {statusLabel}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              disabled={!hasTranscript || isLoading}
              className="flex-1 rounded-2xl bg-foreground text-background px-5 py-4 text-sm font-bold shadow-sm hover:shadow-md active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={restart}
              disabled={!hasTranscript || isLoading}
              className="rounded-2xl border border-border/40 bg-card px-4 py-4 text-sm font-bold text-foreground/80 hover:bg-secondary/30 active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Restart
            </button>
            <button
              onClick={stop}
              disabled={!hasTranscript || isLoading}
              className="rounded-2xl border border-border/40 bg-card px-4 py-4 text-sm font-bold text-foreground/80 hover:bg-secondary/30 active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
              {error} Transcript-only mode is still available.
            </div>
          )}

          {!hasTranscript && (
            <div className="rounded-2xl border border-border/30 bg-secondary/10 px-4 py-3 text-xs font-medium text-muted-foreground/70">
              No transcript segments are available for this session yet.
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-border/30 bg-card/60 p-5 space-y-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            Current Segment
          </p>
          <p className="text-sm font-semibold text-foreground">
            {currentSegmentIndex >= 0
              ? `Segment ${currentSegmentIndex + 1} of ${script.segments.length}`
              : 'Not playing'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {status === 'error'
              ? 'Transcript-only mode is active until audio generation succeeds.'
              : 'Playback remains aligned with the transcript below.'}
          </p>
        </div>
      </aside>

      <section className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-card/5">
        <div className="max-w-2xl mx-auto space-y-12 py-10">
          {script.segments.map((segment, i) => (
            <article
              key={i}
              className={`group flex flex-col gap-6 p-10 rounded-[2rem] border transition-all duration-300 ${
                currentSegmentIndex === i
                  ? 'bg-card border-primary/20 shadow-md'
                  : 'bg-secondary/10 border-transparent opacity-50 group-hover:opacity-90'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner ${
                    segment.speaker === 'A'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-500 text-white'
                  }`}
                >
                  {segment.speaker}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  Speaker {segment.speaker}
                </span>
              </div>
              <p
                className={`text-lg font-medium leading-relaxed tracking-tight ${
                  currentSegmentIndex === i ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {segment.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
