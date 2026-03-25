'use client';

import React from 'react';
import { SurveyOption } from '@/types';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  option: SurveyOption;
  isSelected: boolean;
  onClick: () => void;
  isMultiSelect?: boolean;
}

export default function OptionButton({ option, isSelected, onClick, isMultiSelect }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group relative flex items-center justify-between p-4 rounded-xl transition-all duration-300",
        "border-2",
        isSelected 
          ? "bg-primary/5 border-primary shadow-sm shadow-primary/5" 
          : "bg-secondary/5 border-transparent hover:border-primary/20 hover:bg-secondary/10"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Simple Radio/Checkbox Circle */}
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          isSelected ? "bg-primary border-primary" : "border-foreground/10 group-hover:border-primary/40"
        )}>
          {isSelected && (
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-primary-foreground stroke-[4]">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Option Text only */}
        <span className={cn(
          "text-lg font-medium transition-colors text-left",
          isSelected ? "text-foreground font-bold" : "text-foreground/70 group-hover:text-foreground"
        )}>
          {option.label}
        </span>
      </div>
    </button>
  );
}
