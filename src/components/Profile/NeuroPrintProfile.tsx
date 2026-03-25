'use client';

import React from 'react';
import { NeuroPrintVector } from '@/types';

interface NeuroPrintProfileProps {
  vector: NeuroPrintVector;
  onClose: () => void;
}

const IconClose = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

import { useAppContext } from '@/store/context';
import { useMemo } from 'react';

export default function NeuroPrintProfile({ onClose }: NeuroPrintProfileProps) {
  const { state, dispatch } = useAppContext();
  const vector = state.neuroPrint;

  const handleUpdate = (key: keyof NeuroPrintVector, val: number) => {
    dispatch({
      type: 'SET_NEUROPRINT',
      payload: { ...vector, [key]: val, lastUpdated: Date.now() }
    });
  };
  // Simple radar chart calculation (SVG Points)
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  // Points for the radar chart
  const p1 = { x: centerX, y: centerY - radius * vector.audio }; // Top
  const p2 = { x: centerX + radius * vector.adhd * 0.866, y: centerY + radius * vector.adhd * 0.5 }; // Bottom Right
  const p3 = { x: centerX - radius * vector.scholar * 0.866, y: centerY + radius * vector.scholar * 0.5 }; // Bottom Left

  const points = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

  const archetype = useMemo(() => {
    if (vector.audio > 0.7 && vector.adhd > 0.7) return 'The Auditory Sprinter';
    if (vector.scholar > 0.7 && vector.audio > 0.7) return 'The Deep Audio Scholar';
    if (vector.adhd > 0.7) return 'The High-Velocity Learner';
    return 'The Adaptive Thinker';
  }, [vector]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-background/40 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-5xl bg-card border border-border/40 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.2)] overflow-hidden relative flex flex-col md:flex-row h-full max-h-[850px] animate-in zoom-in-95 duration-700">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-xl bg-secondary/10 hover:bg-red-500/10 hover:text-red-500 transition-all z-20 group"
        >
          <div className="group-hover:rotate-90 transition-transform"><IconClose /></div>
        </button>

        {/* Left: Visualization */}
        <div className="flex-1 p-10 md:p-16 flex flex-col items-center justify-center gap-10 bg-secondary/5 relative overflow-hidden">
          <div className="text-center space-y-3 z-10">
             <h2 className="text-3xl font-[1000] tracking-tightest">Brain Map</h2>
             <p className="text-[10px] font-bold tracking-[0.4em] text-primary/40 uppercase">Live Cognitive Identity</p>
          </div>

          <div className="relative w-64 h-64 z-10">
             <svg width="260" height="260" className="drop-shadow-xl" viewBox="0 0 300 300">
                {/* Reference Circles */}
                <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground/5 opacity-50" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="66" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground/5 opacity-30" strokeDasharray="4 4" />
                
                {/* Axis Lines */}
                <line x1="150" y1="150" x2="150" y2="50" stroke="currentColor" strokeWidth="1" className="text-foreground/10" />
                <line x1="150" y1="150" x2="236.6" y2="200" stroke="currentColor" strokeWidth="1" className="text-foreground/10" />
                <line x1="150" y1="150" x2="63.4" y2="200" stroke="currentColor" strokeWidth="1" className="text-foreground/10" />

                {/* The Vector Polygon */}
                <polygon 
                  points={points} 
                  fill="hsla(var(--primary), 0.15)" 
                  stroke="hsla(var(--primary), 1)" 
                  strokeWidth="3" 
                  className="animate-in fade-in zoom-in duration-1000 delay-300"
                />
             </svg>
             {/* Labels */}
             <span className="absolute top-[-30px] left-1/2 -translate-x-1/2 text-[9px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">Audio</span>
             <span className="absolute bottom-[0px] right-[-30px] text-[9px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">Sprint</span>
             <span className="absolute bottom-[0px] left-[-30px] text-[9px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">Scholar</span>
          </div>

          <div className="px-10 py-5 rounded-2xl bg-primary/5 border border-primary/10 text-center backdrop-blur-xl shadow-sm z-10">
             <span className="text-[9px] font-bold tracking-widest text-primary/30 block mb-1 uppercase">Archetype</span>
             <span className="text-lg font-[1000] tracking-tightest text-foreground uppercase">{archetype}</span>
          </div>

          {/* Decorative Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[80px] rounded-full" />
        </div>

        {/* Right: Stats & Badges */}
        <div className="flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar flex flex-col gap-12 relative bg-card/60">
          <div className="space-y-10">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/20 uppercase">Cognitive Dimensions</h3>
            <div className="grid grid-cols-1 gap-10">
              {[
                { label: 'Podcast Mode', id: 'audio', value: vector.audio, color: 'bg-blue-500', desc: 'Learning that prefers audio + podcast-style recap.' },
                { label: 'Sprint Mode', id: 'adhd', value: vector.adhd, color: 'bg-indigo-500', desc: 'Fast, punchy, short-attention sprint card experience.' },
                { label: 'Scholar Mode', id: 'scholar', value: vector.scholar, color: 'bg-violet-500', desc: 'Structured academic depth with simplified models.' },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-bold tracking-[0.1em] text-foreground/40 uppercase">
                      {item.label}
                    </span>
                    <span className="text-xl font-black text-primary">{Math.round(item.value * 100)}%</span>
                  </div>
                  <div className="relative h-6 flex items-center group/slider">
                    <div className="absolute inset-x-0 h-0.5 bg-secondary rounded-full" />
                    <div 
                      className="absolute h-0.5 bg-primary rounded-full transition-all duration-300 pointer-events-none" 
                      style={{ width: `${item.value * 100}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={item.value}
                      onChange={(e) => handleUpdate(item.id as keyof NeuroPrintVector, parseFloat(e.target.value))}
                      className="absolute inset-x-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                    />
                    <div 
                      className="absolute w-3 h-3 rounded-full bg-primary shadow-lg border border-white dark:border-slate-900 transition-all duration-300 pointer-events-none z-20"
                      style={{ left: `calc(${item.value * 100}% - 6px)` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium mt-4 tracking-tight opacity-40 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


