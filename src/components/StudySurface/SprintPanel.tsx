'use client';

import React from 'react';
import { SprintCard as SprintCardType } from '@/types';

interface SprintPanelProps {
  cards: SprintCardType[];
}

export default function SprintPanel({ cards }: SprintPanelProps) {
  return (
    <div className="flex flex-col gap-14 h-full animate-fade-in-up duration-1000 max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="space-y-3">
           <h3 className="text-4xl font-black tracking-tightest uppercase">Sprint Matrix</h3>
           <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80">Compressed Knowledge Nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-0">
        {cards.map((card, i) => (
          <div 
            key={i}
            className="flex flex-col gap-8 p-12 rounded-[3.5rem] bg-card border border-border/60 hover:border-primary/40 transition-all duration-700 shadow-premium hover:shadow-2xl hover:scale-[1.03] group animate-in zoom-in-95 duration-700 pb-16"
          >
             <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner shadow-primary/10">⚡</div>
                <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/30 uppercase">Card {i+1}</span>
             </div>
             
             <div className="space-y-4">
                <h4 className="text-2xl font-black tracking-tightest leading-tight">{card.title}</h4>
                <div className="h-0.5 w-10 bg-primary/20 rounded-full" />
             </div>

             <ul className="space-y-4">
                {card.bullets.map((bullet, j) => (
                  <li key={j} className="flex gap-4 group/li">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 opacity-40 group-hover/li:opacity-100 transition-opacity" />
                     <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed tracking-tight group-hover/li:text-foreground transition-colors">{bullet}</p>
                  </li>
                ))}
             </ul>

             <div className="mt-auto pt-10 border-t border-border/10 flex flex-col gap-6">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Neuro Challenge</span>
                <p className="text-base font-bold text-foreground leading-relaxed italic">{card.challenge}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
