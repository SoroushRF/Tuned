'use client';

import React from 'react';
import { ScholarContent } from '@/types';
import { useScholar } from '@/hooks/useScholar';

const IconBookOpen = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;

export default function SideBySidePanel({ content }: SideBySidePanelProps) {
  const { activeTerm, selectTerm } = useScholar(content);

  return (
    <div className="flex flex-col gap-10 h-full animate-fade-in-up duration-1000 max-w-6xl mx-auto">
      {/* Tighter Headers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-2">
           <h3 className="text-3xl font-black tracking-tightest">Scholar Mode</h3>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Dynamic Text Alignment Engine</p>
        </div>
        <div className="flex bg-secondary/60 border border-border/80 rounded-2xl p-1 shadow-inner">
          <button className="px-6 py-2 rounded-xl text-xs font-black bg-foreground text-background shadow-lg uppercase tracking-[0.2em]">Comparison</button>
          <button className="px-6 py-2 rounded-xl text-xs font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-[0.2em]">Focus Mode</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 min-h-0">
        {/* Academic Source - Tighter */}
        <div className="flex flex-col gap-8 min-h-0">
          <div className="flex items-center gap-4 px-4 font-black text-muted-foreground/30 text-[10px] uppercase tracking-[0.4em]">
             <IconBookOpen />
             <span>Academic Context</span>
          </div>
          <div className="flex-1 p-10 rounded-[2.5rem] bg-secondary/30 border border-border/60 text-muted-foreground/60 text-base leading-relaxed overflow-y-auto custom-scrollbar font-bold selection:bg-foreground/10 shadow-inner">
            {content.originalText}
          </div>
        </div>

        {/* Simply Nuro - Tighter */}
        <div className="flex flex-col gap-8 min-h-0 relative">
          <div className="flex items-center gap-4 px-4 font-black text-primary/40 text-[10px] uppercase tracking-[0.4em] animate-pulse">
             <IconZap />
             <span>Simply Nuro Synthesis</span>
          </div>
          <div className="flex-1 p-10 rounded-[2.5rem] bg-card border border-border text-foreground text-lg font-black leading-relaxed overflow-y-auto custom-scrollbar shadow-2xl shadow-primary/5 transition-all relative selection:bg-primary/20">
            {content.simplifiedText.split(' ').map((word, i) => {
              const cleanWord = word.replace(/[.,;]/g, '');
              const term = content.keyTerms.find(t => t.term.toLowerCase() === cleanWord.toLowerCase());
              
              if (term) {
                return (
                  <span 
                    key={i}
                    onMouseEnter={() => selectTerm(term.term)}
                    onMouseLeave={() => selectTerm(null)}
                    className="relative inline-block cursor-help text-primary border-b-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all rounded-sm font-black"
                  >
                    {word}{' '}
                    {activeTerm === term.term && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 w-80 p-8 rounded-[2rem] bg-foreground text-background shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] z-[100] animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                           <h5 className="text-[10px] font-black uppercase tracking-[0.3em]">{term.term}</h5>
                        </div>
                        <p className="text-sm text-background/80 leading-relaxed mb-6 font-bold">{term.definition}</p>
                        <div className="pt-6 border-t border-background/20 space-y-4">
                          <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Context Highlight</span>
                          <p className="text-[11px] text-background/60 font-bold leading-relaxed">{term.examRelevance}</p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[16px] border-transparent border-t-foreground" />
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

      {/* Keywords Bar - Tighter */}
      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar px-2">
        {content.keyTerms.map((term, i) => (
          <button 
            key={i}
            onMouseEnter={() => selectTerm(term.term)}
            onMouseLeave={() => selectTerm(null)}
            className={`flex-shrink-0 px-8 py-3.5 rounded-2xl border transition-all flex items-center gap-4 ${
              activeTerm === term.term 
                ? 'bg-foreground border-foreground text-background scale-105 shadow-2xl shadow-foreground/20' 
                : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTerm === term.term ? 'bg-primary' : 'bg-primary/20 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{term.term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface SideBySidePanelProps {
  content: ScholarContent;
}
