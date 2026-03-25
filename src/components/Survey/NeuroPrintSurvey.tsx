'use client';

import React, { useState, useMemo } from 'react';
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
      // Average the scores for the final vector
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
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl flex flex-col items-center gap-16 animate-in slide-in-from-bottom-12 duration-1000">
        
        {/* Progress System */}
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
           <div className="h-2 w-full bg-secondary border border-border rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-primary/40">
              <span>Step {currentStep + 1} of {questions.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span>NeuroPrint Calibration</span>
           </div>
        </div>

        {/* Question Header */}
        <div className="text-center space-y-4">
           <h2 className="text-4xl md:text-5xl font-black tracking-tightest leading-tight max-w-2xl bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
             {questions[currentStep].text}
           </h2>
        </div>

        {/* Options Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10">
           {questions[currentStep].options.map((option, i) => (
             <button
               key={i}
               onClick={() => handleSelect(option.value)}
               className="group flex flex-col items-center text-center gap-10 p-14 rounded-[4rem] bg-foreground dark:bg-card border-2 border-transparent hover:border-primary hover:bg-card transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-xl shadow-foreground/5 relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="w-24 h-24 rounded-[2.5rem] bg-card border border-border flex items-center justify-center text-5xl shadow-inner group-hover:rotate-12 transition-transform duration-500 relative z-10">
                   {option.icon}
                </div>
                <div className="space-y-4 relative z-10">
                   <p className="text-xl font-black leading-tight tracking-tight text-background dark:text-foreground group-hover:text-primary transition-colors">
                     {option.label}
                   </p>
                </div>
                <div className="absolute top-10 right-10 w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
             </button>
           ))}
        </div>

        {/* Bottom Context */}
        <div className="flex items-center gap-5 opacity-40">
           <div className="flex -space-x-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-[8px] font-black text-primary">
                   {['⚡', '🎙️', '📚'][i]}
                </div>
              ))}
           </div>
           <span className="text-[9px] font-black tracking-[0.4em]">Optimizing Strategy Core...</span>
        </div>
      </div>
    </div>
  );
}
