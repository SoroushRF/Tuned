'use client';

import React from 'react';
import { QuizQuestion, RescueCard } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';

interface QuizCardProps {
  questions: QuizQuestion[];
}

/**
 * Parsa - Quiz UI Components
 * Features a seamless transition between standard questions and Rescue Cards.
 */
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
      <div className="text-center py-20 animate-in fade-in zoom-in-95">
        <div className="text-6xl mb-6">🏆</div>
        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-white/40 mb-8">You scored {score} out of {totalQuestions}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-indigo-500 rounded-2xl font-bold hover:bg-indigo-400 transition-colors"
        >
          Study Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 h-full">
      {/* Progress */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Knowledge Check</h4>
          <p className="text-lg font-bold">Question {currentIndex + 1} of {totalQuestions}</p>
        </div>
        <div className="text-indigo-400 font-mono text-sm">Score: {score}</div>
      </div>

      {!activeRescue ? (
        <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-xl font-medium mb-10 leading-relaxed text-white/90">
            {currentQuestion.question}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className="p-5 rounded-2xl bg-white/5 border border-white/5 text-left text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-[0.98]"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-[3rem] bg-amber-500/10 border-2 border-amber-500/40 backdrop-blur-xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-10">🆘</div>
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 italic">Nuro Rescue Card</h4>
          <p className="text-2xl font-medium text-white mb-8 leading-tight">
            {activeRescue.reframeText}
          </p>
          <div className="p-6 rounded-2xl bg-black/40 border border-white/5 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">💡</span>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Mental Model</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
          <button 
            onClick={nextAfterRescue}
            className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all active:scale-[0.98]"
          >
            Got it, moving on 🚀
          </button>
        </div>
      )}
    </div>
  );
}
