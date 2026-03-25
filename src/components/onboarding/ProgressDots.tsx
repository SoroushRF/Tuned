'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  answeredSteps: boolean[];
}

export default function ProgressDots({ currentStep, totalSteps, onStepClick, answeredSteps }: ProgressDotsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);
  const lastCompletedStep = steps.reduce((last, step) => (answeredSteps[step] ? step : last), -1);
  const denom = Math.max(totalSteps - 1, 1);

  return (
    <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-500">
      
      {/* Track Layout */}
      <div className="relative flex items-center gap-3">
        {/* Connection Track */}
        <div className="absolute inset-x-0 h-[1.5px] bg-secondary/20 top-1/2 -translate-y-1/2 z-0" />
        <div 
          className="absolute h-[1.5px] bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out origin-left"
          style={{ width: `${(Math.max(lastCompletedStep, 0) / denom) * 100}%` }}
        />

        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = answeredSteps[step];

          return (
            <button 
              key={step} 
              onClick={() => onStepClick(step)}
              className="relative z-10 p-1 transition-all group"
            >
              {/* Dot Wrapper */}
              <div 
                className={cn(
                  "relative w-3.5 h-3.5 rounded-full transition-all duration-300",
                  "border-2",
                  isCompleted
                    ? "bg-primary border-primary shadow-[0_0_8px_rgba(0,0,0,0.08)]"
                    : isActive
                      ? "bg-background border-primary shadow-sm ring-2 ring-primary/8"
                      : "bg-background border-border group-hover:border-primary/30"
                )}
              >
                {/* Active Inner Dot */}
                {isActive && (
                  <div className="absolute inset-1 bg-primary rounded-full" />
                )}
              </div>

              {/* Hover Label */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest whitespace-nowrap">Level 0{step + 1}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Label */}
      <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
        <span>Calibration Sequence</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="text-primary/60">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
      </div>
    </div>
  );
}
