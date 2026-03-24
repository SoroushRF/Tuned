'use client';

import React from 'react';
import { PodcastScript } from '@/types';
import { usePodcast } from '@/hooks/usePodcast';

interface PodcastPanelProps {
  script: PodcastScript;
}

const IconPlay = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconPause = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>;
const IconStop = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>;

export default function PodcastPanel({ script }: PodcastPanelProps) {
  const { isPlaying, currentSegmentIndex, progress, togglePlayback, stop } = usePodcast(script);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Compact Player Sidebar */}
      <div className="w-full lg:w-80 p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border/60 gap-10 bg-secondary/40">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center text-5xl shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
            🎙️
          </div>
          <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
        </div>

        <div className="text-center space-y-2">
           <h3 className="text-2xl font-black tracking-tighter">AI Podcast</h3>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Multimodal Synthesis</p>
        </div>

        {/* Progress System - Tighter */}
        <div className="w-full space-y-3">
           <div className="h-1 w-full bg-secondary rounded-full overflow-hidden p-[0.5px] border border-border/10">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              <span>Streaming Session</span>
              <span>{Math.round(progress)}%</span>
           </div>
        </div>

        {/* Playback Controls - Smaller */}
        <div className="flex items-center gap-6">
          <button 
            onClick={stop}
            className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 shadow-sm"
          >
            <IconStop />
          </button>
          <button 
            onClick={togglePlayback}
            className="w-20 h-20 rounded-[2rem] bg-foreground text-background flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/20"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </div>
      </div>

      {/* Script Viewing Area - Tighter Script Bubbles */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-card/5">
        <div className="max-w-xl mx-auto space-y-8 py-8">
          {script.segments.map((segment, i) => (
            <div 
              key={i}
              className={`group flex flex-col gap-5 p-8 rounded-[2rem] border transition-all duration-700 ${
                currentSegmentIndex === i 
                  ? 'bg-card border-border shadow-2xl scale-[1.02] shadow-foreground/5' 
                  : 'bg-secondary/10 border-transparent opacity-40 grayscale group-hover:opacity-80 group-hover:grayscale-0'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black shadow-inner ${
                  segment.speaker === 'A' ? 'bg-primary text-white' : 'bg-slate-500 text-white'
                }`}>
                  {segment.speaker}
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-60">
                    {segment.speaker === 'A' ? 'Speaker 01' : 'Expert 02'}
                   </span>
                   {currentSegmentIndex === i && (
                     <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Syncing</span>
                   )}
                </div>
              </div>
              <p className={`text-lg font-bold leading-relaxed tracking-tight ${currentSegmentIndex === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
