'use client';

import React from 'react';
import { ProcessedOutput, NeuroPrintVector } from '@/types';

interface SessionSummaryProps {
  session: ProcessedOutput;
  neuroPrint: NeuroPrintVector;
  onFinish: () => void;
}

const IconArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SessionSummary({ session, neuroPrint, onFinish }: SessionSummaryProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-14 animate-fade-in-up duration-1000 relative overflow-hidden">
      {/* V8 Gloss Background Blob */}
      <div className="absolute inset-0 bg-primary/5 rounded-[6rem] animate-pulse pointer-events-none blur-[120px]" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[160px] animate-float opacity-30" />
      
      {/* Header Celebration */}
      <div className="flex flex-col items-center text-center gap-8 mb-20 relative z-10 transition-transform duration-1000">
        <div className="w-24 h-24 rounded-[3.5rem] bg-foreground text-background flex items-center justify-center text-5xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] animate-float">
           <IconCheck />
        </div>
        <div className="space-y-4">
           <h2 className="text-5xl font-black mb-6 tracking-tightest uppercase leading-tight">Neural Session<br/>Synchronized! ✨</h2>
           <p className="text-muted-foreground max-w-sm font-bold text-lg leading-relaxed opacity-60 uppercase tracking-widest">
             Patterns extracted. Neural vector updated.
           </p>
        </div>
      </div>

      {/* Accomplishment Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative z-10">
        {[
          { label: 'Audio Synthesis', value: `${session.podcast.segments.length}`, icon: '🎙️', color: 'bg-indigo-500/10' },
          { label: 'Sprint Anchors', value: `${session.sprintCards.length}`, icon: '⚡', color: 'bg-violet-500/10' },
          { label: 'Semantic Links', value: `${session.scholar.keyTerms.length}`, icon: '📚', color: 'bg-orchid-500/10' },
        ].map((item, i) => (
          <div key={i} className="p-10 rounded-[4rem] bg-card border-[1.5px] border-border/80 transition-all duration-500 group cursor-default shadow-2xl hover:border-primary/40 hover:scale-[1.05] flex flex-col items-center text-center backdrop-blur-3xl">
             <div className={`w-16 h-16 rounded-[1.75rem] ${item.color} flex items-center justify-center text-4xl mb-8 shadow-inner animate-float transition-all group-hover:rotate-12`}>
                {item.icon}
             </div>
             <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">{item.label}</span>
                <p className="text-3xl font-black tracking-tightest uppercase">{item.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* V8 Profile Calibration Surface */}
      <div className="w-full max-w-5xl p-14 rounded-[5rem] bg-secondary/60 border-[1.5px] border-primary/20 flex flex-col md:flex-row items-center gap-14 mb-20 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] backdrop-blur-3xl group">
         <div className="flex-1 space-y-3 text-center md:text-left transition-transform duration-700 group-hover:translate-x-2">
            <h4 className="text-[11px] uppercase font-black tracking-[0.5em] text-primary">Neural Synchronization Log</h4>
            <p className="text-3xl font-black leading-tight tracking-tightest uppercase">
               Profile Coherence <span className="text-primary animate-pulse">+15.2%</span>
            </p>
         </div>
         <div className="flex items-center gap-10">
            <div className="flex -space-x-4">
               {[1, 2, 3].map((_, i) => (
                 <div key={i} className="w-14 h-14 rounded-full border-[6px] border-card bg-secondary flex items-center justify-center text-xl shadow-2xl transition-all hover:scale-125 hover:z-50 cursor-pointer animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                    {['✨', '🎓', '🏆'][i]}
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-col sm:flex-row gap-8 relative z-10">
         <button 
           onClick={onFinish}
           className="px-16 py-7 bg-foreground text-background rounded-[3rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-110 active:scale-95 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] transition-all flex items-center gap-6 group"
         >
           Initialize Next Wave
           <div className="group-hover:translate-x-2 transition-transform duration-700"><IconArrowRight /></div>
         </button>
         <button className="px-16 py-7 border-2 border-border rounded-[3rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-secondary transition-all hover:scale-105">
           Neural Insights
         </button>
      </div>
    </div>
  );
}
