'use client';

import React from 'react';
import { ScholarContent } from '@/types';
import { useScholar } from '@/hooks/useScholar';

interface SideBySidePanelProps {
  content: ScholarContent;
}

/**
 * Parsa - Scholar Side-by-Side Panel
 * Displays original text alongside a Gemini-simplified version with interactive terms.
 */
export default function SideBySidePanel({ content }: SideBySidePanelProps) {
  const { activeTerm, selectTerm, isSimplifiedVisible } = useScholar(content);

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-300">
          Scholar Insight
        </h3>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-500 text-white shadow-lg">Side-by-Side</button>
          <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white/40 hover:text-white/60">Focus View</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        {/* Original Column */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/40 text-left">Academic Context</h4>
          </div>
          <div className="flex-1 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 text-white/40 text-sm leading-relaxed overflow-y-auto custom-scrollbar italic selection:bg-white/10">
            {content.originalText}
          </div>
        </div>

        {/* Simplified Column */}
        <div className="flex flex-col gap-4 min-h-0 relative">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Simplified by Nuro</h4>
          </div>
          <div className="flex-1 p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-400/20 text-white/90 text-lg leading-relaxed overflow-y-auto custom-scrollbar shadow-2xl shadow-indigo-500/10 selection:bg-indigo-500/30">
            {/* Simple word highlighting logic for mock terms */}
            {content.simplifiedText.split(' ').map((word, i) => {
              const cleanWord = word.replace(/[.,]/g, '');
              const term = content.keyTerms.find(t => t.term.toLowerCase() === cleanWord.toLowerCase());
              
              if (term) {
                return (
                  <span 
                    key={i}
                    onMouseEnter={() => selectTerm(term.term)}
                    onMouseLeave={() => selectTerm(null)}
                    className="relative cursor-help border-b-2 border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all px-0.5 rounded-sm"
                  >
                    {word}{' '}
                    {activeTerm === term.term && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h5 className="text-indigo-300 font-bold mb-1">{term.term}</h5>
                        <p className="text-xs text-white/70 leading-relaxed mb-3">{term.definition}</p>
                        <div className="pt-3 border-t border-white/5">
                          <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Exam Note</span>
                          <p className="text-[10px] text-white/40 mt-1 italic">{term.examRelevance}</p>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1a1a1a]" />
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

      {/* Terms Summary Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {content.keyTerms.map((term, i) => (
          <button 
            key={i}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            {term.term}
          </button>
        ))}
      </div>
    </div>
  );
}
