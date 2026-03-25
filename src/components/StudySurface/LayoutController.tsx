'use client';

import React, { useMemo } from 'react';
import { NeuroPrintVector, ProcessedOutput } from '@/types';
import PodcastPanel from './PodcastPanel';
import SprintPanel from './SprintPanel';
import ScholarPanel from './ScholarPanel';

interface LayoutControllerProps {
  neuroPrint: NeuroPrintVector;
  session: ProcessedOutput;
}

export default function LayoutController({ neuroPrint, session }: LayoutControllerProps) {
  // Identify the single highest-priority mode
  const bestMode = useMemo(() => {
    const scores = [
      { id: 'audio', val: neuroPrint.audio },
      { id: 'adhd', val: neuroPrint.adhd },
      { id: 'scholar', val: neuroPrint.scholar },
    ];
    return scores.sort((a, b) => b.val - a.val)[0].id;
  }, [neuroPrint]);

  const renderPanel = () => {
    switch(bestMode) {
      case 'audio': return <PodcastPanel script={session.podcast} />;
      case 'adhd': return <SprintPanel cards={session.sprintCards} />;
      case 'scholar': return <ScholarPanel content={session.scholar} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full animate-fade-in-up duration-1000 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
         <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Neural Synthesis: {bestMode.toUpperCase()}</h2>
         </div>
      </div>

      <div className="min-h-[700px] border border-border/40 rounded-[3rem] overflow-hidden glass-silk shadow-premium relative">
         {renderPanel()}
      </div>
    </div>
  );
}
