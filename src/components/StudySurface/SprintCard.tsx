'use client';

import React from 'react';
import { SprintCard as SprintCardType } from '@/types';

interface SprintCardProps {
  card: SprintCardType;
  onComplete: () => void;
  showChallenge: boolean;
}

const IconZap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="duotone-icon">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function SprintCard({ card, onComplete, showChallenge }: SprintCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-14 py-10 animate-fade-in-up duration-1000">
      {/* V8 Gloss Knowledge Card */}
      <div className={`p-14 md:p-20 rounded-[4.5rem] bg-card border-[1.5px] border-border/80 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden group ${
        showChallenge ? 'border-primary/40 shadow-primary/10' : 'shadow-foreground/5'
      }`}>
        <div className="flex justify-between items-start mb-14 relative z-10 transition-transform duration-700 group-hover:translate-x-2">
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tightest leading-tight uppercase">{card.title}</h2>
            <div className="flex items-center gap-4">
               <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40">Adaptive Sprint Unit 01</span>
            </div>
          </div>
          <span className="px-6 py-3 rounded-2xl bg-secondary border border-border/80 text-primary text-[10px] font-black uppercase tracking-[0.25em] shadow-inner">
            ACTIVE CALIBRATION
          </span>
        </div>

        <ul className="space-y-10 mb-20 relative z-10">
          {card.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-8 text-2xl font-bold tracking-tight text-foreground/80 leading-relaxed group/item cursor-default selection:bg-primary/10">
              <span className="w-12 h-12 rounded-[1.25rem] bg-secondary border border-border flex items-center justify-center text-[11px] font-black text-primary group-hover/item:rotate-12 group-hover/item:bg-foreground group-hover/item:text-background transition-all shadow-xl">
                0{i + 1}
              </span>
              <span className="flex-1 transition-colors group-hover/item:text-foreground">{bullet}</span>
            </li>
          ))}
        </ul>

        {!showChallenge ? (
          <button 
            onClick={onComplete}
            className="w-full py-8 bg-foreground text-background font-black text-xl rounded-[3rem] hover:scale-[1.05] active:scale-95 transition-all shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] group relative flex items-center justify-center gap-6 overflow-hidden uppercase tracking-widest"
          >
            Pattern Secured ✨
            <IconCheck />
          </button>
        ) : (
          <div className="p-14 md:p-16 rounded-[5rem] bg-secondary/80 border-2 border-primary/20 shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative z-10 group/challenge backdrop-blur-3xl">
            <div className="flex items-center gap-6 mb-10">
               <span className="text-primary animate-float"><IconZap /></span>
               <h4 className="text-[11px] font-black tracking-[0.4em] uppercase text-primary">Neural Verification Step</h4>
            </div>
            
            <p className="text-3xl font-black text-foreground mb-12 leading-tight tracking-tightest selection:bg-primary/20">{card.challenge}</p>
            
            <div className="flex gap-6">
              <input 
                type="text" 
                placeholder="Type response..." 
                className="flex-1 bg-background border border-border rounded-3xl px-10 py-6 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary transition-all font-black text-xl shadow-inner"
                autoFocus
              />
              <button className="px-12 rounded-[2.5rem] bg-primary text-primary-foreground font-black text-sm hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/40 uppercase tracking-widest">
                Check
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surface Context */}
      {card.visualPrompt && (
        <div className="px-14 py-12 rounded-[4rem] bg-secondary/40 border border-border/60 flex items-center gap-12 animate-in slide-in-from-bottom-12 duration-1000 group shadow-2xl backdrop-blur-3xl">
          <div className="w-20 h-20 rounded-[2.5rem] bg-card border border-border flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-12 transition-transform duration-700 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 animate-float">🖼️</div>
          <div className="space-y-2">
            <h5 className="text-[11px] uppercase font-black tracking-[0.5em] text-muted-foreground/40">Visual Context Highlighting</h5>
            <p className="text-sm text-foreground font-bold leading-relaxed tracking-tight">{card.visualPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
