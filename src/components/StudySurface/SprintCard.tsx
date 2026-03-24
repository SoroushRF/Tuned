'use client';

import React from 'react';
import { SprintCard as SprintCardType } from '@/types';

interface SprintCardProps {
  card: SprintCardType;
  onComplete: () => void;
  showChallenge: boolean;
}

/**
 * Parsa - Sprint Card UI
 * A high-focus, gamified chip-style study card with an interactive challenge.
 */
export default function SprintCard({ card, onComplete, showChallenge }: SprintCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-in zoom-in-95 duration-500">
      {/* Main Content Card */}
      <div className={`p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-2 transition-all duration-700 shadow-2xl ${
        showChallenge ? 'border-indigo-500/40 shadow-indigo-500/20' : 'border-white/10'
      }`}>
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {card.title}
          </h2>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
            Sprint Phase
          </span>
        </div>

        <ul className="space-y-6 mb-12">
          {card.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-4 text-xl text-white/80 leading-relaxed group">
              <span className="text-indigo-400 font-bold group-hover:scale-125 transition-transform">•</span>
              {bullet}
            </li>
          ))}
        </ul>

        {!showChallenge ? (
          <button 
            onClick={onComplete}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-indigo-500 hover:border-indigo-400 transition-all active:scale-[0.98]"
          >
            I've absorbed this 🧠
          </button>
        ) : (
          <div className="p-8 rounded-[2rem] bg-indigo-500/20 border border-indigo-400/30 animate-in slide-in-from-top-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">Focus Challenge</h4>
            <p className="text-2xl font-medium text-white mb-6 leading-tight">{card.challenge}</p>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Type your answer..." 
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button className="px-6 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors">
                Verify
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visual Inspiration (Thumbnail) */}
      {card.visualPrompt && (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl opacity-40">🖼️</div>
          <div className="flex-1">
            <h5 className="text-[10px] uppercase font-bold tracking-widest text-white/20 mb-1">Visual Concept</h5>
            <p className="text-xs text-white/40 italic">{card.visualPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
