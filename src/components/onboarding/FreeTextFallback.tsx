'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FreeTextFallbackProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export default function FreeTextFallback({ value, onChange, onSubmit, placeholder = "Tell us in your own words..." }: FreeTextFallbackProps) {
  return (
    <div className="w-full max-w-2xl mt-4 group transition-all duration-700 animate-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-3">
        {/* Label */}
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 ml-6 group-hover:text-primary transition-colors">
          None of these —
        </label>

        {/* Dynamic Input Container */}
        <div className={cn(
          "relative flex items-center p-4 px-6 rounded-2xl border-2 transition-all duration-500",
          "bg-secondary/5 shadow-xl shadow-foreground/5",
          value.length > 0 
            ? "border-primary bg-card ring-2 ring-primary/5" 
            : "border-transparent hover:border-primary/30"
        )}>
          {/* Subtle Background Glow */}
          <div className={cn(
            "absolute inset-0 bg-primary/5 opacity-0 transition-opacity pointer-events-none rounded-[1.8rem]",
            value.length > 0 ? "opacity-100" : "group-hover:opacity-100"
          )} />

          {/* Input field */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none font-bold placeholder:text-foreground/10 text-foreground relative z-10"
          />

          {/* Submit Trigger Indicator for Free Text */}
          {value.length > 0 && (
            <button 
              onClick={onSubmit}
              className="p-3 bg-primary text-primary-foreground rounded-2xl animate-in zoom-in slide-in-from-right-2 duration-300 shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-[4]">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
