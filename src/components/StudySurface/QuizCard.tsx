'use client';

import React from 'react';
import { QuizQuestion, RescueCard as RescueType } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';

const IconTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 22h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" x2="12" y1="8" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" x2="12" y1="16" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconArrowRotate = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function QuizCard({ questions }: QuizCardProps) {
  const { 
    currentQuestion, 
    currentIndex, 
    totalQuestions, 
    score, 
    activeRescue, 
    isFinished, 
    submitAnswer,
    nextAfterRescue 
  } = useQuiz(questions);

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in-up duration-1000">
        <div className="w-28 h-28 rounded-[3.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-10 shadow-[0_40px_80px_-15px_rgba(245,158,11,0.2)] animate-float">
          <IconTrophy />
        </div>
        <h2 className="text-5xl font-black mb-6 tracking-tightest uppercase">Quiz Synchronized! 🎉</h2>
        <p className="text-muted-foreground mb-16 text-sm font-black tracking-widest opacity-60 uppercase">Final Knowledge Rank {score} / {totalQuestions}</p>
        <div className="flex flex-col sm:flex-row gap-6">
           <button 
             onClick={() => window.location.reload()}
             className="px-12 py-6 bg-foreground text-background rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-110 transition-all shadow-2xl shadow-foreground/20"
           >
             Retry Logic
           </button>
           <button className="px-12 py-6 border-2 border-border rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-secondary transition-all">
             Share Pulse
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-16 py-12 h-full animate-fade-in-up duration-1000 px-6">
      {/* V8 Progress Header */}
      <div className="flex justify-between items-end px-4">
        <div className="space-y-3">
          <h4 className="text-[11px] uppercase font-black tracking-[0.5em] text-primary/60">Neural Evaluation Mode</h4>
          <p className="text-4xl font-black tracking-tightest uppercase">Verification {currentIndex + 1} / {totalQuestions}</p>
        </div>
        <div className="px-8 py-3.5 bg-secondary rounded-2xl border border-border shadow-inner flex items-center gap-6">
           <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">Pulse Score</span>
           <span className="text-lg font-black text-primary">{score}</span>
        </div>
      </div>

      {!activeRescue ? (
        <div className="p-14 md:p-16 rounded-[5rem] bg-card border-[1.5px] border-border/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 duration-1000 relative overflow-hidden group backdrop-blur-3xl">
          <p className="text-3xl font-bold mb-16 leading-[1.3] text-foreground tracking-tight selection:bg-primary/20 relative z-10 transition-transform duration-700 group-hover:translate-x-2">
            {currentQuestion.question}
          </p>
          
          <div className="grid grid-cols-1 gap-6 relative z-10">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className="group relative flex items-center gap-8 p-8 rounded-[3rem] bg-secondary/40 border border-transparent hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98] group/opt shadow-inner"
              >
                <div className="w-12 h-12 rounded-[1.25rem] bg-card border border-border flex items-center justify-center text-[11px] font-black text-muted-foreground group-hover/opt:bg-foreground group-hover/opt:text-background transition-all shadow-xl">
                   {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 font-bold text-xl text-foreground/60 group-hover/opt:text-foreground transition-all tracking-tight text-left">{option}</span>
                <div className="w-3 h-3 rounded-full bg-primary opacity-0 group-hover/opt:opacity-100 transition-opacity shadow-[0_0_10px_rgba(99,102,241,1)]" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-14 md:p-20 rounded-[5rem] bg-amber-500/5 border-2 border-amber-500/40 shadow-[0_50px_100px_-20px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-700 relative overflow-hidden group/rescue backdrop-blur-3xl">
          <div className="flex items-center gap-6 mb-12">
             <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-2xl animate-pulse"><IconAlert /></div>
             <h4 className="text-[11px] font-black tracking-[0.5em] uppercase text-amber-500">Neural Calibration Buffer</h4>
          </div>

          <p className="text-4xl font-black text-foreground mb-16 leading-[1.2] tracking-tightest uppercase">
            {activeRescue.reframeText}
          </p>
          
          <div className="p-12 rounded-[4rem] bg-card border border-amber-500/10 mb-16 shadow-2xl shadow-amber-500/5 group/hint relative overflow-hidden backdrop-blur-3xl">
            <div className="flex items-center gap-5 mb-8">
               <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">Cognitive Angle 🧬</span>
            </div>
            <p className="text-xl text-muted-foreground font-bold leading-relaxed tracking-tight opacity-80">{currentQuestion.explanation}</p>
          </div>

          <button 
            onClick={nextAfterRescue}
            className="w-full py-9 bg-amber-500 text-black font-black text-xl rounded-[3rem] hover:scale-[1.05] active:scale-95 transition-all shadow-[0_40px_80px_-15px_rgba(245,158,11,0.4)] flex items-center justify-center gap-6 uppercase tracking-widest"
          >
            Pattern Synchronized
            <IconArrowRotate />
          </button>
        </div>
      )}

      {/* Surface Branding */}
      <div className="flex justify-center flex-wrap gap-8 py-10 border-t border-border/10 opacity-20">
        {['Adaptive Evaluator', 'Gemini Pipeline V2', 'Cognitive Sync'].map((label, i) => (
          <span key={i} className="text-[9px] font-black uppercase tracking-[0.6em]">{label}</span>
        ))}
      </div>
    </div>
  );
}

interface QuizCardProps {
  questions: QuizQuestion[];
}
