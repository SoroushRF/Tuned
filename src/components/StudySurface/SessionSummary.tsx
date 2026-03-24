'use client';

import React from 'react';
import { ProcessedOutput, NeuroPrintVector } from '@/types';

interface SessionSummaryProps {
  session: ProcessedOutput;
  neuroPrint: NeuroPrintVector;
  onFinish: () => void;
}

const IconArrowRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function SessionSummary({ session, neuroPrint, onFinish }: SessionSummaryProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-10 animate-fade-in-up duration-1000 relative">
      {/* Friendly Background Blob - Softer */}
      <div className="absolute inset-0 bg-primary/5 rounded-[4rem] animate-pulse pointer-events-none" />
      
      {/* Header Celebration - Tighter */}
      <div className="flex flex-col items-center text-center gap-6 mb-12 relative z-10">
        <div className="w-16 h-16 rounded-[2rem] bg-foreground text-background flex items-center justify-center text-4xl shadow-2xl animate-bounce">
           <IconCheck />
        </div>
        <div className="space-y-2">
           <h2 className="text-4xl font-black mb-4 tracking-tightest uppercase">Session Wrapped! ✨</h2>
           <p className="text-muted-foreground max-w-sm font-bold text-base leading-relaxed opacity-60 uppercase">
             Your patterns are secure. Profile synced.
           </p>
        </div>
      </div>

      {/* Accomplishment Grid - Tighter */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        {[
          { label: 'Audio Units', value: `${session.podcast.segments.length}`, icon: '🎙️', color: 'bg-blue-500/10' },
          { label: 'Sprint Speed', value: `${session.sprintCards.length}`, icon: '⚡', color: 'bg-indigo-500/10' },
          { label: 'Scholar Clarity', value: `${session.scholar.keyTerms.length}`, icon: '📚', color: 'bg-violet-500/10' },
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-[3rem] bg-card border border-border transition-all group cursor-default shadow-lg hover:border-primary/40">
             <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-3xl mb-6 shadow-inner animate-float`}>
                {item.icon}
             </div>
             <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{item.label}</span>
                <p className="text-xl font-black tracking-tight uppercase">{item.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Profile Calibration - Tighter */}
      <div className="w-full max-w-4xl p-10 rounded-[3.5rem] bg-secondary/50 border border-primary/20 flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10 shadow-lg">
         <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">NeuroPrint Calibration</h4>
            <p className="text-2xl font-black leading-tight tracking-tightest uppercase">
               Profile Sync <span className="text-primary">+12.4%</span>
            </p>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
               {[1, 2, 3].map((_, i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-4 border-card bg-secondary flex items-center justify-center text-sm shadow-xl shadow-foreground/5 transition-transform hover:scale-110 cursor-pointer">
                    {['✨', '🎓', '🏆'][i]}
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Control Actions - Tighter */}
      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
         <button 
           onClick={onFinish}
           className="px-12 py-5 bg-foreground text-background rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 shadow-2xl shadow-foreground/10 transition-all flex items-center gap-4 group"
         >
           Initialize Next session
           <div className="group-hover:translate-x-1 transition-transform duration-500"><IconArrowRight /></div>
         </button>
         <button className="px-12 py-5 border-2 border-border rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary transition-all">
           Review Insights
         </button>
      </div>
    </div>
  );
}
