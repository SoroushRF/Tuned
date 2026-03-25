'use client';

import React from 'react';
import { ScholarContent } from '@/types';
import { useScholar } from '@/hooks/useScholar';

const IconBookOpen = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconZap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SideBySidePanel({ content }: SideBySidePanelProps) {
  const { activeTerm, selectTerm } = useScholar(content);

  return (
    <div className="flex flex-col gap-12 h-full animate-fade-in-up duration-1000 max-w-6xl mx-auto py-10">
      {/* V8 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="space-y-3">
           <h3 className="text-4xl font-black tracking-tightest uppercase">Scholar Logic</h3>
           <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80">Semantic Content Alignment Engine</p>
        </div>
        <div className="flex bg-secondary/60 border border-border/80 rounded-3xl p-1.5 shadow-xl backdrop-blur-3xl">
          <button className="px-8 py-3 rounded-2xl text-xs font-black bg-foreground text-background shadow-2xl uppercase tracking-[0.25em]">Split View</button>
          <button className="px-8 py-3 rounded-2xl text-xs font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.25em]">Focus</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 min-h-0">
        {/* Academic Source */}
        <div className="flex flex-col gap-10 min-h-0">
          <div className="flex items-center gap-5 px-6 font-black text-muted-foreground/60 text-[11px] uppercase tracking-[0.5em]">
             <IconBookOpen />
             <span>Reference Material</span>
          </div>
          <div className="flex-1 p-14 rounded-[3.5rem] bg-secondary/30 border border-border/60 text-foreground/80 text-lg leading-[1.6] overflow-y-auto custom-scrollbar font-bold selection:bg-foreground/10 shadow-inner">
            {content.originalText}
          </div>
        </div>

        {/* Simply Nuro */}
        <div className="flex flex-col gap-10 min-h-0 relative">
          <div className="flex items-center gap-5 px-6 font-black text-primary/80 text-[11px] uppercase tracking-[0.5em] animate-pulse">
             <IconZap />
             <span>Neural Optimized Content</span>
          </div>
          <div className="flex-1 p-14 rounded-[3.5rem] bg-card border border-primary/20 text-foreground text-xl font-black leading-[1.6] overflow-y-auto custom-scrollbar shadow-2xl shadow-primary/5 transition-all relative selection:bg-primary/20 backdrop-blur-3xl">
            {content.simplifiedText.split(' ').map((word, i) => {
              const cleanWord = word.replace(/[.,;]/g, '');
              const term = content.keyTerms.find(t => t.term.toLowerCase() === cleanWord.toLowerCase());
              
              if (term) {
                return (
                  <span 
                    key={i}
                    onMouseEnter={() => selectTerm(term.term)}
                    onMouseLeave={() => selectTerm(null)}
                    className="relative inline-block cursor-help text-primary border-b-4 border-primary/10 hover:border-primary hover:bg-primary/5 transition-all rounded-md font-black"
                  >
                    {word}{' '}
                    {activeTerm === term.term && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-10 w-96 p-10 rounded-[2.5rem] bg-foreground text-background shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] z-[100] animate-in fade-in slide-in-from-bottom-8 duration-700 backdrop-blur-3xl">
                        <div className="flex items-center gap-5 mb-6">
                           <div className="w-3 h-3 rounded-full bg-primary" />
                           <h5 className="text-[11px] font-black uppercase tracking-[0.4em]">{term.term}</h5>
                        </div>
                        <p className="text-base text-background leading-relaxed mb-8 font-bold">{term.definition}</p>
                        <div className="pt-8 border-t border-background/20 space-y-5">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Neural Insight</span>
                          <p className="text-xs text-background/80 font-bold leading-relaxed">{term.examRelevance}</p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[20px] border-transparent border-t-foreground" />
                      </div>
                    )}
                  </span>
                );
              }
              return word + ' ';
            })}
          </div>
        </div>
      </div>

      {/* Keywords Bar */}
      <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar px-4">
        {content.keyTerms.map((term, i) => (
          <button 
            key={i}
            onMouseEnter={() => selectTerm(term.term)}
            onMouseLeave={() => selectTerm(null)}
            className={`flex-shrink-0 px-10 py-5 rounded-[2rem] border transition-all flex items-center gap-5 ${
              activeTerm === term.term 
                ? 'bg-foreground border-foreground text-background scale-105 shadow-2xl shadow-foreground/30' 
                : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${activeTerm === term.term ? 'bg-primary' : 'bg-primary/20 animate-pulse'}`} />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">{term.term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface SideBySidePanelProps {
  content: ScholarContent;
}
