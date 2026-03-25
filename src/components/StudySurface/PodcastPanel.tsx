'use client';

import React, { useState } from 'react';
import { PodcastScript } from '@/types';
import { usePodcast } from '@/hooks/usePodcast';

interface PodcastPanelProps {
  script: PodcastScript;
}

export default function PodcastPanel({ script }: PodcastPanelProps) {
  const [showTranscript, setShowTranscript] = useState(true);

  const {
    status,
    currentSegmentIndex,
    currentSentenceIndex,
    currentTime,
    duration,
    error,
    wasShortened,
    sentenceTimeline,
    togglePlayback,
    restart,
    stop,
    seekTo,
    skipBy,
    seekToSentence,
  } = usePodcast(script);

  const hasTranscript = script.segments.length > 0;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isShortened = Boolean(script.isShortened || wasShortened);

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

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="w-full rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-foreground/80 hover:bg-secondary/30 active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          </button>
          {isShortened && (
            <div className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
              Shortened for quick playback
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-border/30 bg-card/70 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                {statusLabel}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0)}
              step={0.1}
              value={Math.min(currentTime, duration || currentTime)}
              onChange={(event) => seekTo(Number(event.target.value))}
              disabled={!hasTranscript || isLoading || duration <= 0}
              aria-label="Podcast scrubber"
              className="w-full accent-primary disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => skipBy(-10)}
              disabled={!hasTranscript || isLoading || duration <= 0}
              className="flex-1 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-foreground/75 hover:bg-secondary/30 active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -10s
            </button>
            <button
              onClick={() => skipBy(10)}
              disabled={!hasTranscript || isLoading || duration <= 0}
              className="flex-1 rounded-2xl border border-border/40 bg-card px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-foreground/75 hover:bg-secondary/30 active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +10s
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
            {currentSentenceIndex >= 0
              ? `Sentence ${currentSentenceIndex + 1} of ${sentenceTimeline.length}`
              : 'Not playing'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {currentSegmentIndex >= 0
              ? `Segment ${currentSegmentIndex + 1} of ${script.segments.length}`
              : 'No segment selected'}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {status === 'error'
              ? 'Transcript-only mode is active until audio generation succeeds.'
              : 'Playback remains aligned with the transcript below.'}
          </p>
        </div>
      </aside>

      <section className={`flex-1 p-14 overflow-y-auto custom-scrollbar bg-card/5 ${showTranscript ? '' : 'hidden'}`}>
        <div className="max-w-2xl mx-auto space-y-12 py-10">
          {script.segments.map((segment, segmentIndex) => {
            const segmentSentences = sentenceTimeline.filter(
              (sentence) => sentence.segmentIndex === segmentIndex
            );
            const segmentIsActive = currentSegmentIndex === segmentIndex;

            return (
            <article
              key={segmentIndex}
              className={`group flex flex-col gap-6 p-10 rounded-[2rem] border transition-all duration-300 ${
                segmentIsActive
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
              <div className="space-y-3">
                {segmentSentences.length > 0 ? segmentSentences.map((sentence) => {
                  const isSentenceActive = currentSentenceIndex === sentence.sentenceIndex;
                  return (
                    <button
                      key={sentence.sentenceIndex}
                      onClick={() => seekToSentence(sentence.sentenceIndex)}
                      disabled={duration <= 0 || isLoading}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition-all duration-300 ${
                        isSentenceActive
                          ? 'bg-primary/10 border-primary/25 text-foreground shadow-sm'
                          : 'bg-background/50 border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">
                        Sentence {sentence.sentenceIndex + 1}
                      </span>
                      <span className="text-lg font-medium leading-relaxed tracking-tight">
                        {sentence.text}
                      </span>
                    </button>
                  );
                }) : (
                  <button
                    onClick={() => seekToSentence(segmentIndex)}
                    disabled={duration <= 0 || isLoading}
                    className="w-full text-left rounded-2xl border px-4 py-3 bg-background/50 border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg font-medium leading-relaxed tracking-tight">
                      {segment.text}
                    </span>
                  </button>
                )}
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
