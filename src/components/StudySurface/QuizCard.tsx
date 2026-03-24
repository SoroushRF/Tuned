'use client';

import React from 'react';
import { QuizQuestion, RescueCard as RescueType } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';

const IconTrophy = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/></svg>;
const IconArrowRotate = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;

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
      <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-fade-in-up duration-1000">
        <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-8 shadow-2xl">
          <IconTrophy />
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tightest uppercase">Quiz Complete! 🎉</h2>
        <p className="text-muted-foreground mb-12 text-sm font-black tracking-widest opacity-60 uppercase">Final Rank {score} / {totalQuestions}</p>
        <div className="flex flex-col sm:flex-row gap-4">
           <button 
             onClick={() => window.location.reload()}
             className="px-8 dy-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-foreground/10"
           >
             Try Again
           </button>
           <button className="px-8 py-4 border-2 border-border rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-secondary transition-all">
             Share Profile
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-12 h-full animate-fade-in-up duration-1000 px-4">
      {/* Tighter Progress */}
      <div className="flex justify-between items-end px-1">
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/60">Knowledge Verification</h4>
          <p className="text-3xl font-black tracking-tightest">0{currentIndex + 1} of 0{totalQuestions}</p>
        </div>
        <div className="px-6 py-2.5 bg-secondary rounded-xl border border-border shadow-inner">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mr-4">Rank</span>
           <span className="text-sm font-black text-primary">{score}</span>
        </div>
      </div>

      {!activeRescue ? (
        <div className="p-12 md:p-14 rounded-[4rem] bg-card border-2 border-border/80 shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden group">
          <p className="text-2xl font-bold mb-12 leading-[1.3] text-foreground tracking-tight selection:bg-primary/20 relative z-10">
            {currentQuestion.question}
          </p>
          
          <div className="grid grid-cols-1 gap-4 relative z-10">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className="group relative flex items-center gap-6 p-7 p-6 rounded-[2.5rem] bg-secondary/30 border border-transparent hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.98] group/opt shadow-inner"
              >
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover/opt:bg-foreground group-hover/opt:text-background transition-all shadow-sm">
                   {String.fromCharCode(65 + i)}
                </div>
                <span className="flex-1 font-bold text-lg text-foreground/60 group-hover/opt:text-foreground transition-all tracking-tight">{option}</span>
                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover/opt:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 md:p-14 rounded-[4rem] bg-amber-500/5 border-2 border-amber-500/40 glass shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden group/rescue">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center shadow-lg"><IconAlert /></div>
             <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500">Neural Rescue System</h4>
          </div>

          <p className="text-3xl font-black text-foreground mb-12 leading-[1.2] tracking-tightest">
            {activeRescue.reframeText}
          </p>
          
          <div className="p-10 rounded-[3rem] bg-card border border-amber-500/10 mb-12 shadow-inner group/hint relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Knowledge Angle 🧠</span>
            </div>
            <p className="text-base text-muted-foreground font-bold leading-relaxed tracking-tight opacity-80">{currentQuestion.explanation}</p>
          </div>

          <button 
            onClick={nextAfterRescue}
            className="w-full py-7 bg-amber-500 text-black font-black text-lg rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-4 uppercase tracking-widest"
          >
            Secured Now
            <IconArrowRotate />
          </button>
        </div>
      )}

      {/* Surface Branding - Tighter */}
      <div className="flex justify-center flex-wrap gap-5 py-6 border-t border-border/10 opacity-20">
        {['Neural-Optimized', 'Gemini Pipeline', 'Core Logic'].map((label, i) => (
          <span key={i} className="text-[8px] font-black uppercase tracking-[0.4em]">{label}</span>
        ))}
      </div>
    </div>
  );
}

interface QuizCardProps {
  questions: QuizQuestion[];
}
