'use client';

import React, { useMemo, useState } from 'react';
import { NeuroPrintVector, ProcessedOutput } from '@/types';
import PodcastPanel from './PodcastPanel';
import SprintCard from './SprintCard';
import SideBySidePanel from './SideBySidePanel';
import QuizCard from './QuizCard';
import { mockQuizQuestions } from '@/lib/mock';

interface LayoutControllerProps {
  neuroPrint: NeuroPrintVector;
  session: ProcessedOutput;
}

/**
 * Adaptive Layout Controller
 * Decides how to arrange the study modes based on the NeuroPrint.
 */
export default function LayoutController({ neuroPrint, session }: LayoutControllerProps) {
  // Determine dominant mode
  const initialMode = useMemo(() => {
    const scores = [
      { mode: 'audio', value: neuroPrint.audio },
      { mode: 'adhd', value: neuroPrint.adhd },
      { mode: 'scholar', value: neuroPrint.scholar },
    ];
    return scores.sort((a, b) => b.value - a.value)[0].mode;
  }, [neuroPrint]);

  const [activeMode, setActiveMode] = useState<string>(initialMode);

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dynamic Mode Switcher (Tab-like but adaptive) */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto backdrop-blur-md">
        {[
          { id: 'audio', label: 'Podcast', icon: '🎙️' },
          { id: 'adhd', label: 'Sprint', icon: '🏃' },
          { id: 'scholar', label: 'Scholar', icon: '📖' },
          { id: 'quiz', label: 'Quiz', icon: '🏆' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeMode === mode.id 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <span>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {/* Main Content Area - Adaptive sizing */}
      <div className="flex-1 min-h-0">
        {activeMode === 'audio' && (
          <PodcastPanel script={session.podcast} />
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
          <SideBySidePanel content={session.scholar} />
        )}

        {activeMode === 'quiz' && (
          <QuizCard questions={mockQuizQuestions} />
        )}
      </div>
    </div>
  );
}
