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

export default function NeuroPrintProfile({ vector: initialVector, onClose }: NeuroPrintProfileProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-4xl bg-card border-2 border-border rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col md:flex-row h-full max-h-[800px] animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 p-4 rounded-full bg-secondary hover:bg-red-500/10 hover:text-red-500 transition-all z-20 group"
        >
          <div className="group-hover:rotate-90 transition-transform"><IconClose /></div>
        </button>

        {/* Left: Visualization */}
        <div className="flex-1 p-16 flex flex-col items-center justify-center gap-12 bg-secondary/30 relative">
          <div className="text-center space-y-3">
             <h2 className="text-4xl font-black tracking-tightest">Your Brain Map</h2>
             <p className="text-[10px] font-black tracking-[0.4em] text-primary/80 dark:text-primary/60 uppercase">Live Cognitive Dimensions</p>
          </div>

          <div className="relative w-72 h-72">
             <svg width="300" height="300" className="drop-shadow-2xl">
                {/* Reference Circles */}
                <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-border dark:opacity-40 opacity-80" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="66" fill="none" stroke="currentColor" strokeWidth="1" className="text-border dark:opacity-30 opacity-60" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="33" fill="none" stroke="currentColor" strokeWidth="1" className="text-border dark:opacity-20 opacity-40" strokeDasharray="4 4" />
                
                {/* Axis Lines */}
                <line x1="150" y1="150" x2="150" y2="50" stroke="currentColor" strokeWidth="2" className="text-border dark:opacity-40 opacity-70" />
                <line x1="150" y1="150" x2="236.6" y2="200" stroke="currentColor" strokeWidth="2" className="text-border dark:opacity-40 opacity-70" />
                <line x1="150" y1="150" x2="63.4" y2="200" stroke="currentColor" strokeWidth="2" className="text-border dark:opacity-40 opacity-70" />

                {/* The Vector Polygon */}
                <polygon 
                  points={points} 
                  fill="rgba(99, 102, 241, 0.3)" 
                  stroke="rgba(99, 102, 241, 1)" 
                  strokeWidth="4" 
                  className="animate-in fade-in zoom-in duration-1000 delay-300"
                />
             </svg>
             {/* Labels */}
             <span className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-primary/90 dark:text-primary/70 uppercase">Audio Synthesis</span>
             <span className="absolute bottom-[10px] right-[-40px] text-[10px] font-black tracking-widest text-primary/90 dark:text-primary/70 uppercase">Sprint Velocity</span>
             <span className="absolute bottom-[10px] left-[-40px] text-[10px] font-black tracking-widest text-primary/90 dark:text-primary/70 uppercase">Scholar Depth</span>
          </div>

          <div className="px-10 py-5 rounded-[2.5rem] bg-primary/5 border border-primary/10 text-center backdrop-blur-3xl shadow-2xl">
             <span className="text-[9px] font-black tracking-widest text-primary/40 block mb-1">Learner Archetype</span>
             <span className="text-xl font-black tracking-tightest text-foreground">{archetype}</span>
          </div>
        </div>

        {/* Right: Stats & Badges */}
        <div className="flex-1 p-16 overflow-y-auto custom-scrollbar flex flex-col gap-12 relative bg-card/50">
          <div className="space-y-10">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/60 dark:text-muted-foreground/30 uppercase">Cognitive Breakdown</h3>
            <div className="grid grid-cols-1 gap-8">
              {[
                { label: 'Auditory Path', id: 'audio', value: vector.audio, color: 'bg-blue-500', desc: 'Efficiency in speech-to-logic conversion.' },
                { label: 'Micro-Focus', id: 'adhd', value: vector.adhd, color: 'bg-indigo-500', desc: 'Resilience in high-velocity contexts.' },
                { label: 'Context Depth', id: 'scholar', value: vector.scholar, color: 'bg-violet-500', desc: 'Ability to simplify abstract structures.' },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm font-black tracking-tight text-foreground/80">{item.label}</span>
                    <span className="text-xl font-black text-primary">{Math.round(item.value * 100)}%</span>
                  </div>
                  <div className="relative h-6 flex items-center group/slider">
                    <div className="absolute inset-x-0 h-1 bg-secondary rounded-full border border-border/50" />
                    <div 
                      className="absolute h-1 bg-primary rounded-full transition-all duration-300 pointer-events-none" 
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
                      className="absolute w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)] border-2 border-white dark:border-slate-900 transition-all duration-300 pointer-events-none z-20"
                      style={{ left: `calc(${item.value * 100}% - 8px)` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold mt-4 opacity-40 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/30">Neural Accomplishments</h3>
            <div className="grid grid-cols-4 gap-4 pb-10">
                {['🎙️', '🔥', '📚', '🧩', '🧪', '🏹', '🏹', '🏰'].map((emoji, i) => (
                  <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-border group hover:scale-110 active:scale-95 transition-all cursor-pointer ${i < 4 ? 'bg-secondary' : 'bg-secondary/20 dark:bg-secondary/40 opacity-40 grayscale'}`}>
                     <span className="group-hover:rotate-12 transition-transform duration-500">{emoji}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


