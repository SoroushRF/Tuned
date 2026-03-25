'use client';

import React, { useState } from 'react';
import { NeuroPrintVector } from '@/types';

interface SurveyQuestion {
  id: string;
  text: string;
  options: { label: string; value: Partial<NeuroPrintVector>; icon: string }[];
}

const questions: SurveyQuestion[] = [
  {
    id: 'input-pref',
    text: "How do you naturally absorb new information?",
    options: [
      { label: "Listen to conversations or podcasts", value: { audio: 0.8, adhd: 0.4, scholar: 0.3 }, icon: '🎙️' },
      { label: "Read structured summaries and deep text", value: { audio: 0.2, adhd: 0.3, scholar: 0.9 }, icon: '📚' },
      { label: "Visual charts and rapid micro-chunks", value: { audio: 0.4, adhd: 0.9, scholar: 0.4 }, icon: '⚡' },
    ]
  },
  {
    id: 'focus-span',
    text: "What describes your typical study session?",
    options: [
      { label: "Short, high-intensity bursts of focus", value: { adhd: 0.9, audio: 0.5 }, icon: '🏎️' },
      { label: "Slow, steady deep-work blocks", value: { scholar: 0.8, adhd: 0.2 }, icon: '🧘' },
      { label: "Dynamic, switching between tasks", value: { audio: 0.7, adhd: 0.6 }, icon: '🌀' },
    ]
  },
  {
    id: 'complexity',
    text: "When you encounter complex jargon, you prefer:",
    options: [
      { label: "An analogy that explains it simply", value: { scholar: 0.9, adhd: 0.6 }, icon: '🧩' },
      { label: "A conversational explanation", value: { audio: 0.8, scholar: 0.4 }, icon: '💬' },
      { label: "Getting the core facts instantly", value: { adhd: 0.8, scholar: 0.3 }, icon: '🎯' },
    ]
  },
  {
    id: 'reinforcement',
    text: "How do you verify you've actually learned something?",
    options: [
      { label: "Explaining it back out loud", value: { audio: 0.9, scholar: 0.5 }, icon: '🗣️' },
      { label: "Applying it to a micro-challenge", value: { adhd: 0.8, scholar: 0.6 }, icon: '🏹' },
      { label: "Deep-diving into related literature", value: { scholar: 0.9, adhd: 0.2 }, icon: '📖' },
    ]
  },
  {
    id: 'motivation',
    text: "What keeps you engaged the longest?",
    options: [
      { label: "Gamification, streaks, and scores", value: { adhd: 0.9, audio: 0.4 }, icon: '🏆' },
      { label: "Academic rigor and detailed insights", value: { scholar: 0.9, audio: 0.3 }, icon: '🎓' },
      { label: "Listening to experts discuss the topic", value: { audio: 0.9, scholar: 0.4 }, icon: '🎙️' },
    ]
  },
  {
    id: 'env',
    text: "Your ideal digital study environment is:",
    options: [
      { label: "Clean, minimal, and high-contrast", value: { scholar: 0.8, adhd: 0.9 }, icon: '🖥️' },
      { label: "Media-rich and interactive", value: { audio: 0.6, adhd: 0.7 }, icon: '🎮' },
      { label: "Structure-heavy and analytical", value: { scholar: 0.9, audio: 0.2 }, icon: '🔬' },
    ]
  }
];

interface NeuroPrintSurveyProps {
  onComplete: (vector: NeuroPrintVector) => void;
}

export default function NeuroPrintSurvey({ onComplete }: NeuroPrintSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<NeuroPrintVector[]>([]);

  const handleSelect = (value: Partial<NeuroPrintVector>) => {
    const newScores = [...scores, { 
      audio: value.audio || 0.5, 
      adhd: value.adhd || 0.5, 
      scholar: value.scholar || 0.5,
      lastUpdated: Date.now(),
      manualOverride: false
    }];
    
    setScores(newScores);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const finalVector: NeuroPrintVector = {
        audio: newScores.reduce((acc, s) => acc + s.audio, 0) / newScores.length,
        adhd: newScores.reduce((acc, s) => acc + s.adhd, 0) / newScores.length,
        scholar: newScores.reduce((acc, s) => acc + s.scholar, 0) / newScores.length,
        lastUpdated: Date.now(),
        manualOverride: false
      };
      onComplete(finalVector);
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-700">
      {/* Heavy Internal Blur */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-20">
        {/* Progress System */}
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
           <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden relative border border-border/10">
              <div 
                className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                style={{ width: `${progress}%` }}
              />
           </div>
           <p className="text-[10px] font-black tracking-[0.5em] text-primary/40 uppercase">
              Phase {currentStep + 1} • Calibration
           </p>
        </div>

        {/* Question Header */}
        <div className="text-center space-y-6">
           <h2 className="text-5xl md:text-6xl font-black tracking-tightest leading-[1.1] max-w-3xl text-shimmer">
             {questions[currentStep].text}
           </h2>
        </div>

        {/* Options Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
           {questions[currentStep].options.map((option, i) => (
             <button
               key={i}
               onClick={() => handleSelect(option.value)}
               className="group relative flex flex-col items-center gap-12 p-12 rounded-[4rem] glass-silk border border-border/40 hover:border-primary hover:bg-card hover:scale-[1.05] active:scale-95 transition-all duration-500 shadow-premium"
             >
                <div className="w-24 h-24 rounded-[2.5rem] bg-card border border-border/60 flex items-center justify-center text-5xl shadow-inner group-hover:rotate-12 transition-transform duration-700 relative z-10">
                   {option.icon}
                </div>
                <div className="space-y-4 relative z-10">
                   <p className="text-xl font-bold leading-tight tracking-tight text-foreground/80 group-hover:text-primary transition-colors">
                     {option.label}
                   </p>
                </div>
                <div className="absolute top-10 right-10 w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
             </button>
           ))}
        </div>

        {/* Ambient Footer */}
        <div className="flex items-center gap-6 opacity-30">
           <div className="h-px w-10 bg-border" />
           <span className="text-[9px] font-black tracking-[0.4em] uppercase">Mind Mapping Core Active</span>
           <div className="h-px w-10 bg-border" />
        </div>
      </div>
    </div>
  );
}
