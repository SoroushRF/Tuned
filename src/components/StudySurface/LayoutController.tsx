'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { NeuroPrintVector, ProcessedOutput } from '@/types';
import PodcastPanel from './PodcastPanel';
import SprintCard from './SprintCard';
import SideBySidePanel from './SideBySidePanel';
import QuizCard from './QuizCard';
import SessionSummary from './SessionSummary';
import { mockQuizQuestions } from '@/lib/mock';

interface LayoutControllerProps {
  neuroPrint: NeuroPrintVector;
  session: ProcessedOutput;
}

const IconMic = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" x2="12" y1="19" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="duotone-icon">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LayoutController({ neuroPrint, session }: LayoutControllerProps) {
  useEffect(() => {
    const scores = [
      { mode: 'audio', value: neuroPrint.audio },
      { mode: 'adhd', value: neuroPrint.adhd },
      { mode: 'scholar', value: neuroPrint.scholar },
    ];
    const topMode = scores.sort((a, b) => b.value - a.value)[0].mode;
    setActiveMode(topMode);
  }, [neuroPrint]);

  const [activeMode, setActiveMode] = useState<string>('audio');
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  if (isSessionFinished) {
    return (
      <SessionSummary 
        session={session} 
        neuroPrint={neuroPrint} 
        onFinish={() => setIsSessionFinished(false)} 
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-fade-in-up duration-1000 max-w-5xl mx-auto">
      {/* V8 Gloss Mode Pill */}
      <div className="flex justify-center -mt-8">
        <nav className="flex gap-2 p-2 bg-card/60 border border-primary/10 rounded-full shadow-2xl backdrop-blur-3xl">
          {[
            { id: 'audio', label: 'Podcast', icon: <IconMic /> },
            { id: 'adhd', label: 'Sprint', icon: <IconZap /> },
            { id: 'scholar', label: 'Scholar', icon: <IconBook /> },
            { id: 'quiz', label: 'Quiz', icon: <IconCheck /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-6 py-3.5 rounded-full text-[11px] font-black tracking-[0.2em] transition-all duration-500 flex items-center gap-4 group ${
                activeMode === mode.id 
                  ? 'bg-foreground text-background scale-105 shadow-2xl shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div className={`${activeMode === mode.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                {mode.icon}
              </div>
              <span className="hidden sm:inline uppercase">{mode.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 min-h-[550px] relative">
        <div className="relative h-full animate-in fade-in zoom-in-95 duration-700">
          {activeMode === 'audio' && (
             <div className="h-full border border-border/80 bg-card/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700">
               <PodcastPanel script={session.podcast} />
             </div>
          )}

          {activeMode === 'adhd' && (
            <div className="h-full flex flex-col justify-center">
              <SprintCard 
                card={session.sprintCards[0]} 
                onComplete={() => {}} 
                showChallenge={false} 
              />
            </div>
          )}

          {activeMode === 'scholar' && (
            <div className="h-full border border-border bg-card/20 rounded-[3rem] p-4 overflow-hidden shadow-2xl transition-all duration-700">
              <SideBySidePanel content={session.scholar} />
            </div>
          )}

          {activeMode === 'quiz' && (
            <div className="h-full">
              <QuizCard questions={mockQuizQuestions} />
            </div>
          )}
        </div>
      </div>

      {/* Surface Status */}
      <div className="flex justify-between items-center py-6 border-t border-border/10">
        <div className="flex items-center gap-4">
           <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Nuro Engine Active</p>
        </div>
        <button 
          onClick={() => setIsSessionFinished(true)}
          className="px-10 py-5 rounded-full border-2 border-border/80 bg-secondary/40 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-all hover:scale-105 shadow-xl"
        >
          Wrap Up Study session
        </button>
      </div>
    </div>
  );
}
