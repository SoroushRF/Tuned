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
  const [activeMode, setActiveMode] = useState<string | 'adaptive'>('adaptive');
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Identify high-priority modes for adaptive layout
  const highModes = useMemo(() => {
    const modes: string[] = [];
    if (neuroPrint.audio > 0.6) modes.push('audio');
    if (neuroPrint.adhd > 0.6) modes.push('adhd');
    if (neuroPrint.scholar > 0.6) modes.push('scholar');
    
    // If none are > 0.6, pick the highest one
    if (modes.length === 0) {
      const scores = [
        { id: 'audio', val: neuroPrint.audio },
        { id: 'adhd', val: neuroPrint.adhd },
        { id: 'scholar', val: neuroPrint.scholar },
      ];
      modes.push(scores.sort((a, b) => b.val - a.val)[0].id);
    }
    return modes;
  }, [neuroPrint]);

  useEffect(() => {
    // Pulse to adaptive whenever profile changes significantly
    setActiveMode('adaptive');
  }, [neuroPrint]);

  if (isSessionFinished) {
    return (
      <SessionSummary 
        session={session} 
        neuroPrint={neuroPrint} 
        onFinish={() => setIsSessionFinished(false)} 
      />
    );
  }

  const renderPanel = (mode: string) => {
    switch(mode) {
      case 'audio': return (
        <div className="h-full border border-border/80 bg-card/10 rounded-[3rem] overflow-hidden shadow-premium">
          <PodcastPanel script={session.podcast} />
        </div>
      );
      case 'adhd': return (
        <div className="h-full border border-border/80 bg-card/5 rounded-[3rem] p-4 flex flex-col justify-center shadow-premium">
          <SprintCard card={session.sprintCards[0]} onComplete={() => {}} showChallenge={false} />
        </div>
      );
      case 'scholar': return (
        <div className="h-full border border-border/80 bg-card/20 rounded-[3rem] p-4 overflow-hidden shadow-premium">
          <SideBySidePanel content={session.scholar} />
        </div>
      );
      case 'quiz': return (
        <div className="h-full scale-95 origin-top">
          <QuizCard questions={mockQuizQuestions} />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-12 animate-fade-in-up duration-1000 max-w-7xl mx-auto">
      {/* Mode Controls */}
      <div className="flex justify-center -mt-8">
        <nav className="flex gap-2 p-2 bg-card/60 border border-primary/10 rounded-full shadow-premium backdrop-blur-3xl">
          <button 
            onClick={() => setActiveMode('adaptive')}
            className={`px-6 py-3.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-4 transition-all ${
              activeMode === 'adaptive' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground/60 hover:text-foreground'
            }`}
          >
             ✨ ADAPTIVE VIEW
          </button>
          {[
            { id: 'audio', label: 'Podcast', icon: <IconMic /> },
            { id: 'adhd', label: 'Sprint', icon: <IconZap /> },
            { id: 'scholar', label: 'Scholar', icon: <IconBook /> },
            { id: 'quiz', label: 'Quiz', icon: <IconCheck /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-6 py-3.5 rounded-full text-[10px] font-black tracking-widest transition-all duration-500 flex items-center gap-4 group ${
                activeMode === mode.id 
                  ? 'bg-foreground text-background shadow-premium' 
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div className={`${activeMode === mode.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                {mode.icon}
              </div>
              <span className="hidden lg:inline uppercase">{mode.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Surface Viewport */}
      <div className={`flex-1 min-h-[600px] relative animate-in fade-in zoom-in-95 duration-700`}>
         {activeMode === 'adaptive' ? (
           <div className={`grid gap-10 h-full ${highModes.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'max-w-4xl mx-auto'}`}>
              {highModes.map(mode => (
                <div key={mode} className="h-full">
                   {renderPanel(mode)}
                </div>
              ))}
           </div>
         ) : (
           <div className="max-w-4xl mx-auto h-full">
              {renderPanel(activeMode)}
           </div>
         )}
      </div>

      {/* Surface Status */}
      <div className="flex justify-between items-center py-8 border-t border-border/10">
        <div className="flex items-center gap-4">
           <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">Nuro Synthesis Core Active</p>
        </div>
        <button 
          onClick={() => setIsSessionFinished(true)}
          className="px-12 py-5 rounded-full border border-border/40 bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all hover:scale-105 shadow-premium"
        >
          Wrap Up Session
        </button>
      </div>
    </div>
  );
}
