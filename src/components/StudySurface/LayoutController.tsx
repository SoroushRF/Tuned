'use client';

import React, { useMemo, useState } from 'react';
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

const IconMic = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const IconZap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconBook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function LayoutController({ neuroPrint, session }: LayoutControllerProps) {
  const initialMode = useMemo(() => {
    const scores = [
      { mode: 'audio', value: neuroPrint.audio },
      { mode: 'adhd', value: neuroPrint.adhd },
      { mode: 'scholar', value: neuroPrint.scholar },
    ];
    return scores.sort((a, b) => b.value - a.value)[0].mode;
  }, [neuroPrint]);

  const [activeMode, setActiveMode] = useState<string>(initialMode);
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
    <div className="w-full flex flex-col gap-8 animate-fade-in-up duration-1000 max-w-5xl mx-auto">
      {/* Friendly Mode Pill - Smaller */}
      <div className="flex justify-center -mt-6">
        <nav className="flex gap-1.5 p-1.5 bg-card/60 border border-border rounded-full shadow-2xl backdrop-blur-xl">
          {[
            { id: 'audio', label: 'Podcast', icon: <IconMic /> },
            { id: 'adhd', label: 'Sprint', icon: <IconZap /> },
            { id: 'scholar', label: 'Scholar', icon: <IconBook /> },
            { id: 'quiz', label: 'Quiz', icon: <IconCheck /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 group ${
                activeMode === mode.id 
                  ? 'bg-foreground text-background scale-105 shadow-xl shadow-foreground/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div className={`${activeMode === mode.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                {mode.icon}
              </div>
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Viewport - Smaller Radius */}
      <div className="flex-1 min-h-[500px] relative">
        <div className="relative h-full animate-in fade-in zoom-in-95 duration-500">
          {activeMode === 'audio' && (
             <div className="h-full border border-border bg-card/10 rounded-[2.5rem] overflow-hidden shadow-inner">
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
            <div className="h-full border border-border bg-card/10 rounded-[2.5rem] p-3 overflow-hidden shadow-inner">
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

      {/* Surface Status - Tighter */}
      <div className="flex justify-between items-center py-6 border-t border-border/10">
        <div className="flex items-center gap-3">
           <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Intelligence Active</p>
        </div>
        <button 
          onClick={() => setIsSessionFinished(true)}
          className="px-8 py-4 rounded-full border-2 border-border/60 bg-secondary/60 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-all hover:scale-105 shadow-md"
        >
          Wrap Up Study
        </button>
      </div>
    </div>
  );
}
