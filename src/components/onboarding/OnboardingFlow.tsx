'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NeuroPrintDeltas, NeuroPrintVector } from '@/types';
import { SURVEY_QUESTIONS } from '@/lib/neuroprint/weights';
import { calculateVector } from '@/lib/neuroprint/engine';
import ProgressDots from './ProgressDots';
import QuestionCard from './QuestionCard';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onBeginCalibration: () => void;
  onComplete: (vector: NeuroPrintVector) => void;
}

interface StepState {
  selectedIndices: number[];
  freeText: string;
}

export default function OnboardingFlow({ onBeginCalibration, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [history, setHistory] = useState<Record<number, StepState>>({});
  const [isCalibrating, setIsCalibrating] = useState(false);

  const currentQuestion = SURVEY_QUESTIONS[currentStep];

  // Derive state for the current view
  const selectedIndices = history[currentStep]?.selectedIndices || [];
  const freeText = history[currentStep]?.freeText || '';

  // Update max step as user progresses
  useEffect(() => {
    if (currentStep > maxStepReached) {
      setMaxStepReached(currentStep);
    }
  }, [currentStep, maxStepReached]);

  // ... (keep totalDeltas calculation)
  const totalDeltas = useMemo(() => {
    const deltas: NeuroPrintDeltas = { audio: 0, adhd: 0, scholar: 0 };
    Object.entries(history).forEach(([stepIdx, state]) => {
      const question = SURVEY_QUESTIONS[Number(stepIdx)];
      state.selectedIndices.forEach(idx => {
        const optionDeltas = question.options[idx].deltas;
        if (optionDeltas.audio) deltas.audio += optionDeltas.audio;
        if (optionDeltas.adhd) deltas.adhd += optionDeltas.adhd;
        if (optionDeltas.scholar) deltas.scholar += optionDeltas.scholar;
      });
    });
    return deltas;
  }, [history]);

  const updateCurrentStepState = (newState: Partial<StepState>) => {
    setHistory(prev => {
      const current = prev[currentStep] || { selectedIndices: [], freeText: '' };
      
      let nextSelected = newState.selectedIndices ?? current.selectedIndices;
      let nextFreeText = newState.freeText ?? current.freeText;

      // Logic: If user starts typing free text, clear all selections
      if (newState.freeText && newState.freeText.trim().length > 0) {
        nextSelected = [];
      }
      
      // Logic: If user selects an option, clear free text
      if (newState.selectedIndices && newState.selectedIndices.length > 0) {
        nextFreeText = '';
      }

      return {
        ...prev,
        [currentStep]: {
          selectedIndices: nextSelected,
          freeText: nextFreeText
        }
      };
    });
  };

  const handleNext = async () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCalibrating(true);
      onBeginCalibration();
      try {
        const res = await fetch('/api/gemini/analyze-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history, questions: SURVEY_QUESTIONS })
        });
        const vector = await res.json();
        onComplete(vector);
      } catch (error) {
        console.error("Calibration error:", error);
        // Fallback to static if API fails
        onComplete(calculateVector(totalDeltas));
      } finally {
        setIsCalibrating(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepJump = (step: number) => {
    if (step <= maxStepReached) {
      setCurrentStep(step);
    }
  };

  const handleSelectOption = (index: number) => {
    if (currentQuestion.isMultiSelect) {
      const current = history[currentStep]?.selectedIndices || [];
      
      let newIndices: number[];
      const isNoneOfThese = index === 3; // "None of these apply to me"

      if (isNoneOfThese) {
        // If picking "None of these", it clears everything else
        newIndices = [3];
      } else {
        // If picking a standard option, remove "None of these" from the list
        const filtered = current.filter(i => i !== 3);
        newIndices = filtered.includes(index) 
          ? filtered.filter(i => i !== index) 
          : [...filtered, index];
      }
      
      updateCurrentStepState({ selectedIndices: newIndices });
    } else {
      updateCurrentStepState({ selectedIndices: [index] });
      setTimeout(() => {
        if (currentStep < SURVEY_QUESTIONS.length - 1) {
          setCurrentStep(prev => prev + 1);
        }
      }, 400);
    }
  };

  // Keyboard support for Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const hasSelection = (history[currentStep]?.selectedIndices?.length || 0) > 0;
        const hasText = (history[currentStep]?.freeText?.trim()?.length || 0) > 0;
        if (hasSelection || hasText) {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, history]);

  const isNextEnabled = (history[currentStep]?.selectedIndices?.length || 0) > 0 || (history[currentStep]?.freeText?.trim()?.length || 0) > 0;
  const isLastStep = currentStep === SURVEY_QUESTIONS.length - 1;
  const answeredSteps = useMemo(() => {
    return Array.from({ length: SURVEY_QUESTIONS.length }, (_, step) => {
      const state = history[step];
      if (!state) return false;
      const hasSelection = (state.selectedIndices?.length || 0) > 0;
      const hasText = (state.freeText?.trim()?.length || 0) > 0;
      return hasSelection || hasText;
    });
  }, [history]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center py-6 md:py-12 px-6 overflow-y-auto antialiased">
      <div className="w-full max-w-4xl flex flex-col items-center gap-12 md:gap-16">
        
        {/* Navigation & Progress Header */}
        <div className="w-full max-w-2xl flex items-start gap-4 md:gap-8 opacity-90">
          {/* Always Present Back Button */}
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={cn(
                  "p-4 rounded-full transition-all flex items-center justify-center shrink-0",
                  currentStep === 0
                    ? "bg-secondary/5 text-foreground/10 cursor-not-allowed scale-90"
                    : "bg-secondary/20 text-foreground/60 hover:bg-secondary/30 hover:text-foreground active:translate-y-[1px]"
                )}
                title="Go Back"
              >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-[3]">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-grow flex flex-col gap-6">
            <ProgressDots 
              currentStep={currentStep} 
              totalSteps={SURVEY_QUESTIONS.length} 
              onStepClick={handleStepJump}
              answeredSteps={answeredSteps}
            />

            {/* Next/Finish Button ONLY on last step */}
            {isLastStep && (
              <div className="flex justify-center">
                <button
                  onClick={handleNext}
                  disabled={!isNextEnabled || isCalibrating}
                  className={cn(
                    "px-10 py-3 rounded-full font-bold transition-all duration-300 uppercase tracking-[0.2em] text-[10px]",
                    isNextEnabled && !isCalibrating
                      ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md active:translate-y-[1px]"
                      : "bg-foreground/5 text-foreground/20 border border-foreground/5 cursor-not-allowed opacity-50"
                  )}
                >
                  {isCalibrating ? "Calibrating Digital Brain..." : "Finish & Calibrate"}
                </button>
              </div>
            )}
          </div>

          <div className="w-[52px] hidden md:block" />
        </div>

        {/* Question Area */}
        <QuestionCard 
          question={currentQuestion}
          selectedOptionIndices={selectedIndices}
          freeText={freeText}
          onSelectOption={handleSelectOption}
          onChangeFreeText={(text) => updateCurrentStepState({ freeText: text })}
          onSubmit={() => handleNext()}
        />
      </div>
    </div>
  );
}
