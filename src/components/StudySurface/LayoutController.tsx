'use client';

import React, { useMemo } from 'react';
import { NeuroPrintVector, ProcessedOutput } from '@/types';
import PodcastPanel from './PodcastPanel';
import SprintPanel from './SprintPanel';
import ScholarPanel from './ScholarPanel';
import { getDominantMode, getLayoutStrategy } from '@/lib/layout';

interface LayoutControllerProps {
  neuroPrint: NeuroPrintVector;
  session: ProcessedOutput;
}

export default function LayoutController({ neuroPrint, session }: LayoutControllerProps) {
  // Identify the single highest-priority mode
  const bestMode = useMemo(() => {
    return getDominantMode(neuroPrint);
  }, [neuroPrint]);

  const layoutStrategy = useMemo(() => getLayoutStrategy(neuroPrint), [neuroPrint]);

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
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,0,0,0.08)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/50">Workspace Mode: {bestMode.toUpperCase()}</h2>
         </div>
      </div>

      <div className={[
        "min-h-[700px] border border-border/40 rounded-[3rem] overflow-hidden glass-silk shadow-premium relative",
        layoutStrategy === 'single' ? 'max-w-5xl mx-auto' : '',
      ].join(' ')}>
         {renderPanel()}
      </div>
    </div>
  );
}
