'use client';

import React from 'react';
import { SurveyQuestion } from '@/types';
import OptionButton from './OptionButton';
import FreeTextFallback from './FreeTextFallback';

interface QuestionCardProps {
  question: SurveyQuestion;
  selectedOptionIndices: number[];
  freeText: string;
  onSelectOption: (index: number) => void;
  onChangeFreeText: (text: string) => void;
  onSubmit?: () => void;
}

export default function QuestionCard({ 
  question, 
  selectedOptionIndices, 
  freeText, 
  onSelectOption, 
  onChangeFreeText,
  onSubmit
}: QuestionCardProps) {
  
  return (
    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in duration-700">
      
      {/* Simplified Question Header */}
      <div className="w-full max-w-2xl text-left space-y-2">
        <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground">
          {question.text}
        </h2>
        {question.isMultiSelect && (
          <p className="text-sm font-medium text-muted-foreground/70 uppercase tracking-widest">
            Select all that apply
          </p>
        )}
      </div>

      {/* Vertical Stack of Options */}
      <div className="w-full max-w-2xl flex flex-col gap-2">
        {question.options.map((option, i) => (
          <OptionButton
            key={i}
            option={option}
            isSelected={selectedOptionIndices.includes(i)}
            onClick={() => onSelectOption(i)}
          />
        ))}
      </div>

      {/* Minimal Fallback Input */}
      <div className="w-full max-w-2xl mt-4">
        <FreeTextFallback 
          value={freeText} 
          onChange={onChangeFreeText} 
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
