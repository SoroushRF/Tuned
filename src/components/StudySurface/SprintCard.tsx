'use client';

import React from 'react';
import { SprintCard as SprintCardType } from '@/types';

interface SprintCardProps {
  card: SprintCardType;
  onComplete: () => void;
  showChallenge: boolean;
}

const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function SprintCard({ card, onComplete, showChallenge }: SprintCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 animate-fade-in-up duration-1000">
      {/* Compact Knowledge Card */}
      <div className={`p-10 md:p-14 rounded-[3.5rem] bg-card border-2 border-border/60 transition-all duration-700 shadow-2xl relative overflow-hidden group ${
        showChallenge ? 'border-primary/30 shadow-primary/10' : 'shadow-foreground/5'
      }`}>
        <div className="flex justify-between items-start mb-10 relative z-10 transition-transform duration-700 group-hover:translate-x-1">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tightest leading-tight">{card.title}</h2>
            <div className="flex items-center gap-3">
               <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Knowledge Sprint Part 01</span>
            </div>
          </div>
          <span className="px-5 py-2.5 rounded-2xl bg-secondary border border-border/80 text-primary text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">
            CALIBRATED
          </span>
        </div>

        <ul className="space-y-8 mb-16 relative z-10">
          {card.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-6 text-xl font-bold tracking-tight text-foreground/80 leading-relaxed group/item cursor-default selection:bg-primary/10">
              <span className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-primary group-hover/item:rotate-6 group-hover/item:bg-foreground group-hover/item:text-background transition-all shadow-sm">
                0{i + 1}
              </span>
              <span className="flex-1 transition-colors group-hover/item:text-foreground">{bullet}</span>
            </li>
          ))}
        </ul>

        {!showChallenge ? (
          <button 
            onClick={onComplete}
            className="w-full py-6 bg-foreground text-background font-black text-lg rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-foreground/20 group relative flex items-center justify-center gap-5 overflow-hidden uppercase tracking-widest"
          >
            Secured ✨
            <IconCheck />
          </button>
        ) : (
          <div className="p-12 md:p-14 rounded-[4rem] bg-secondary/80 border-2 border-primary/10 shadow-xl animate-in fade-in zoom-in-95 duration-500 relative z-10 group/challenge">
            <div className="flex items-center gap-4 mb-8">
               <span className="text-primary animate-float"><IconZap /></span>
               <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Micro-Challenge Verification</h4>
            </div>
            
            <p className="text-2xl font-black text-foreground mb-10 leading-tight tracking-tightest selection:bg-primary/20">{card.challenge}</p>
            
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Type response..." 
                className="flex-1 bg-background border border-border/80 rounded-2xl px-8 py-5 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary transition-all font-black text-lg shadow-inner"
                autoFocus
              />
              <button className="px-10 rounded-2xl bg-primary text-white font-black text-sm hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/30 uppercase tracking-widest">
                Check
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surface Context - Tighter */}
      {card.visualPrompt && (
        <div className="px-12 py-10 rounded-[3rem] bg-secondary/30 border border-border/40 flex items-center gap-10 animate-in slide-in-from-bottom-8 duration-1000 group shadow-lg">
          <div className="w-16 h-16 rounded-[2rem] bg-card border border-border flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform duration-700 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100">🖼️</div>
          <div className="space-y-1">
            <h5 className="text-[10px] uppercase font-black tracking-[0.4em] text-muted-foreground/30">Visual Observation</h5>
            <p className="text-xs text-foreground font-bold leading-relaxed tracking-tight">{card.visualPrompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
