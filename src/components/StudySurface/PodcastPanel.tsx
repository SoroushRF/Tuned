'use client';

import React, { useState, useEffect } from 'react';
import { PodcastScript } from '@/types';

interface PodcastPanelProps {
  script: PodcastScript;
}

export default function PodcastPanel({ script }: PodcastPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row h-full animate-fade-in-up">
      {/* Glossy Player Sidebar */}
      <div className="w-full lg:w-80 p-12 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-border/20 gap-10 bg-secondary/10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[3rem] bg-foreground text-background flex items-center justify-center text-4xl shadow-2xl relative z-10 animate-float">
            🎙️
          </div>
          <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[50px] opacity-20 transition-opacity" />
        </div>

        <div className="text-center space-y-4">
           <h3 className="text-xl font-black tracking-tightest uppercase">Session Live</h3>
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="w-20 h-20 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center hover:scale-[1.1] active:scale-95 transition-all shadow-xl"
           >
             {isPlaying ? '⏸️' : '▶️'}
           </button>
        </div>
      </div>

      {/* Script Viewing Area */}
      <div className="flex-1 p-14 overflow-y-auto custom-scrollbar bg-card/5">
        <div className="max-w-2xl mx-auto space-y-12 py-10">
          {script.segments.map((segment, i) => (
            <div 
              key={i}
              className={`group flex flex-col gap-6 p-10 rounded-[2.5rem] border transition-all duration-700 ${
                currentIdx === i 
                  ? 'bg-card border-primary/20 shadow-2xl scale-[1.02] shadow-primary/5' 
                  : 'bg-secondary/10 border-transparent opacity-40 group-hover:opacity-80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-inner ${
                  segment.speaker === 'A' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-slate-500 text-white shadow-lg shadow-slate-500/30'
                }`}>
                  {segment.speaker}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                 Speaker {segment.speaker}
                </span>
              </div>
              <p className={`text-lg font-bold leading-relaxed tracking-tight ${currentIdx === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
