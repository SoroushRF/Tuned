'use client';

import React from 'react';
import { ScholarContent } from '@/types';

interface ScholarPanelProps {
  content: ScholarContent;
}

export default function ScholarPanel({ content }: ScholarPanelProps) {
  return (
    <div className="flex flex-col gap-12 h-full animate-fade-in-up duration-1000 max-w-7xl mx-auto py-14 px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 px-6">
        <div className="space-y-4">
           <h3 className="text-5xl font-[1000] tracking-tightest uppercase leading-none">Scholar Logic</h3>
           <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/80">Semantic Content Alignment Engine</p>
        </div>
        <div className="flex bg-secondary/40 border border-border/60 rounded-3xl p-1.5 shadow-xl backdrop-blur-3xl">
          <button className="px-10 py-3.5 rounded-2xl text-[10px] font-black bg-foreground text-background shadow-2xl uppercase tracking-[0.3em]">Split View</button>
          <button className="px-10 py-3.5 rounded-2xl text-[10px] font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.3em]">Focus</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 min-h-0">
        {/* Academic Source */}
        <div className="flex flex-col gap-10 min-h-0 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="flex items-center gap-6 px-10 font-[1000] text-muted-foreground/60 text-[10px] uppercase tracking-[0.6em]">
             <div className="w-2 h-2 rounded-full bg-border" />
             <span>Reference Material</span>
          </div>
          <div className="flex-1 p-16 rounded-[4rem] bg-secondary/15 border border-border/40 text-foreground/80 text-xl leading-[1.7] overflow-y-auto custom-scrollbar font-bold selection:bg-foreground/10 shadow-inner">
            {content.originalText}
          </div>
        </div>

        {/* Simply Nuro */}
        <div className="flex flex-col gap-10 min-h-0 relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <div className="flex items-center gap-6 px-10 font-[1000] text-primary text-[10px] uppercase tracking-[0.6em] animate-pulse">
             <div className="w-2 h-2 rounded-full bg-primary" />
             <span>Neural Optimized Content</span>
          </div>
          <div className="flex-1 p-16 rounded-[4rem] bg-card border border-primary/20 text-foreground text-2xl font-black leading-[1.65] overflow-y-auto custom-scrollbar shadow-2xl shadow-primary/5 relative selection:bg-primary/20 backdrop-blur-3xl">
            {content.simplifiedText}
          </div>
        </div>
      </div>

      {/* Keywords Bar */}
      <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar px-6 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
        {content.keyTerms.map((term, i) => (
          <div 
            key={i}
            className="flex-shrink-0 px-12 py-6 rounded-[2.5rem] bg-card border border-border text-foreground hover:scale-105 transition-all flex flex-col gap-4 shadow-sm w-[380px]"
          >
            <div className="flex items-center gap-5">
               <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
               <h5 className="text-[11px] font-[1000] uppercase tracking-[0.5em]">{term.term}</h5>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-bold line-clamp-2">{term.definition}</p>
            <div className="pt-6 border-t border-border/10 space-y-4">
              <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.6em]">Insights</span>
              <p className="text-[11px] text-muted-foreground/40 font-bold leading-relaxed">{term.examRelevance}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
