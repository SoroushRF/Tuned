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

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-8 animate-in slide-in-from-top-4 duration-1000">
      
      {/* Dots Layout */}
      <div className="flex items-center gap-6">
        {steps.map((step) => {
          const isActive = step === currentStep;
          const isCompleted = answeredSteps[step];

          return (
            <button 
              key={step} 
              onClick={() => onStepClick(step)}
              className="relative group p-2 transition-all"
            >
              {/* Dot Wrapper */}
              <div 
                className={cn(
                  "relative w-4 h-4 rounded-full transition-all duration-500 ease-out",
                  "border-2",
                  isCompleted 
                    ? "bg-primary border-primary scale-100" 
                    : isActive 
                      ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/30"
                      : "bg-transparent border-foreground/10 scale-90 group-hover:scale-100 group-hover:border-primary/40"
                )}
              >
              </div>

            </button>
          );
        })}
      </div>

      {/* Profile Calibration Text */}
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 transition-colors">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="w-1 h-1 rounded-full bg-primary/20" />
      </div>
    </div>
  );
}
