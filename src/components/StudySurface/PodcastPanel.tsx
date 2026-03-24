'use client';

import React from 'react';
import { PodcastScript } from '@/types';
import { usePodcast } from '@/hooks/usePodcast';

interface PodcastPanelProps {
  script: PodcastScript;
}

/**
 * Parsa - Podcast UI Panel
 * Displays the podcast player with synchronized script highlights.
 */
export default function PodcastPanel({ script }: PodcastPanelProps) {
  const { isPlaying, currentSegmentIndex, progress, togglePlayback, stop } = usePodcast(script);

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Player Header */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 text-8xl opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">🎙️</div>
        
        <div className="flex flex-col items-center text-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Nuro Podcast Engine</span>
          </div>

          <div className="flex items-center gap-8">
            <button 
              onClick={stop}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all active:scale-90"
            >
              ⏹️
            </button>
            <button 
              onClick={togglePlayback}
              className="w-24 h-24 rounded-[2rem] bg-white text-black flex items-center justify-center text-4xl shadow-2xl shadow-white/20 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all opacity-40">
              ⏭️
            </button>
          </div>

          <div className="w-full max-w-md space-y-2">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span>Optimizing Audio</span>
              <span>Gemini Flash 1.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Script View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
        {script.segments.map((segment, i) => (
          <div 
            key={i}
            className={`p-6 rounded-3xl border transition-all duration-500 ${
              currentSegmentIndex === i 
                ? 'bg-indigo-500/10 border-indigo-500/30 scale-[1.02] shadow-xl' 
                : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                segment.speaker === 'A' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
              }`}>
                {segment.speaker}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-20">
                {segment.speaker === 'A' ? 'Host A' : 'Expert B'}
              </span>
            </div>
            <p className={`leading-relaxed ${currentSegmentIndex === i ? 'text-white' : 'text-white/60'}`}>
              {segment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
