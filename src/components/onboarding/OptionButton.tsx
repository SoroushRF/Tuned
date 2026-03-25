'use client';

import React from 'react';
import { SurveyOption } from '@/types';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  option: SurveyOption;
  isSelected: boolean;
  onClick: () => void;
}

export default function OptionButton({ option, isSelected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300",
        "border border-transparent",
        isSelected
          ? "bg-primary/8 border-primary/30 shadow-[0_6px_14px_rgba(0,0,0,0.05)] ring-1 ring-primary/10"
          : "bg-card/80 border-border/60 shadow-sm hover:bg-secondary/20 hover:border-border/80"
      )}
    >
      <div className="flex items-center gap-5">
        {/* Animated Select Indicator */}
        <div className={cn(
          "w-6 h-6 rounded-lg border-[1.5px] flex items-center justify-center transition-all duration-300",
          isSelected
            ? "bg-primary border-primary shadow-sm rotate-0"
            : "border-foreground/10 group-hover:border-primary/40 rotate-[-6deg]"
        )}>
          {isSelected && (
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-primary-foreground stroke-[4.5] animate-in fade-in duration-200">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex flex-col items-start justify-center gap-0">
          <span className={cn(
            "text-lg font-bold tracking-tight transition-all duration-300",
            isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
          )}>
            {option.label}
          </span>
        </div>
      </div>
      
      {/* Decorative Shimmer on Selection */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
      )}
    </button>
  );
}
