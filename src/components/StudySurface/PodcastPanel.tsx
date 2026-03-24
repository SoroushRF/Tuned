'use client';

import React from 'react';
import { PodcastScript } from '@/types';
import { usePodcast } from '@/hooks/usePodcast';

interface PodcastPanelProps {
  script: PodcastScript;
}

const IconPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPause = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <rect width="4" height="16" x="6" y="4" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect width="4" height="16" x="14" y="4" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStop = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="duotone-icon">
    <rect width="18" height="18" x="3" y="3" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PodcastPanel({ script }: PodcastPanelProps) {
  const { isPlaying, currentSegmentIndex, progress, togglePlayback, stop } = usePodcast(script);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Glossy Player Sidebar */}
      <div className="w-full lg:w-96 p-14 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border/60 gap-12 bg-secondary/30 backdrop-blur-3xl">
        <div className="relative group">
          <div className="w-52 h-52 rounded-[4rem] bg-foreground text-background flex items-center justify-center text-6xl shadow-2xl relative z-10 hover:scale-[1.05] transition-transform duration-700 animate-float">
            🎙️
          </div>
          <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[64px] opacity-20 group-hover:opacity-50 transition-opacity" />
        </div>

        <div className="text-center space-y-3">
           <h3 className="text-3xl font-black tracking-tightest uppercase">Synthesis Live</h3>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Multimodal Anchor Active</p>
        </div>

        {/* Progress System */}
        <div className="w-full space-y-4">
           <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden p-[1px] border border-border/10">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              <span>Streaming Session</span>
              <span>{Math.round(progress)}%</span>
           </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={stop}
            className="w-16 h-16 rounded-[2rem] bg-secondary/80 border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            <IconStop />
          </button>
          <button 
            onClick={togglePlayback}
            className="w-24 h-24 rounded-[3.5rem] bg-foreground text-background flex items-center justify-center hover:scale-[1.1] active:scale-95 transition-all shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </div>
      </div>

      {/* Script Viewing Area */}
      <div className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-card/5">
        <div className="max-w-2xl mx-auto space-y-12 py-10">
          {script.segments.map((segment, i) => (
            <div 
              key={i}
              className={`group flex flex-col gap-8 p-12 rounded-[3.5rem] border transition-all duration-700 ${
                currentSegmentIndex === i 
                  ? 'bg-card border-primary/20 shadow-2xl scale-[1.02] shadow-primary/10' 
                  : 'bg-secondary/10 border-transparent opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center text-[10px] font-black shadow-inner ${
                  segment.speaker === 'A' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-slate-500 text-white shadow-lg shadow-slate-500/30'
                }`}>
                  {segment.speaker}
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                    {segment.speaker === 'A' ? 'Host Voice' : 'Analytic Expert'}
                   </span>
                   {currentSegmentIndex === i && (
                     <span className="text-[8px] font-black text-primary uppercase tracking-[0.25em] animate-pulse mt-1">Live Sync</span>
                   )}
                </div>
              </div>
              <p className={`text-xl font-bold leading-relaxed tracking-tight ${currentSegmentIndex === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
