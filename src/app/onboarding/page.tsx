'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/context';
import { NeuroPrintVector } from '@/types';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const IconBrain = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.78-3.94 2.5 2.5 0 0 1-1.26-4.5 2.5 2.5 0 0 1 1.26-4.5 2.5 2.5 0 0 1 2.78-3.94A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.78-3.94 2.5 2.5 0 0 0 1.26-4.5 2.5 2.5 0 0 0-1.26-4.5 2.5 2.5 0 0 0-2.78-3.94A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

export default function OnboardingPage() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const [stage, setStage] = useState<'survey' | 'analyzing' | 'complete'>('survey');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    "Weighting Neural Patterns...",
    "Calibrating Attention Span...",
    "Synthesizing Material Density...",
    "Mapping Cognitive Vector...",
    "Building Adaptive Surface..."
  ];

  useEffect(() => {
    if (stage === 'analyzing') {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage('complete'), 500);
            return 100;
          }
          return prev + 1;
        });

        if (analysisProgress % 20 === 0) {
          setAnalysisStep(Math.floor(analysisProgress / 20));
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage, analysisProgress]);

  useEffect(() => {
    if (stage === 'complete') {
      const timer = setTimeout(() => {
        router.push('/study');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, router]);

  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />

      {stage === 'survey' && (
        <OnboardingFlow 
          onComplete={(vector: NeuroPrintVector) => {
            dispatch({ type: 'SET_NEUROPRINT', payload: vector });
            setStage('analyzing');
          }} 
        />
      )}

      {stage === 'analyzing' && (
        <div className="max-w-md w-full p-12 text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
           <div className="flex justify-center mb-16 relative">
              <IconBrain />
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-20" />
           </div>

           <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tightest uppercase leading-tight">Neural Syncing</h2>
              <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase opacity-40">CALIBRATING YOUR PROFILE</p>
           </div>

           <div className="space-y-6">
              <div className="h-1 w-full bg-secondary rounded-full overflow-hidden border border-border/10">
                 <div 
                   className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                   style={{ width: `${analysisProgress}%` }}
                 />
              </div>
              <p className="text-sm font-black text-primary animate-pulse tracking-widest uppercase">
                {analysisSteps[analysisStep] || "Finalizing Sync..."}
              </p>
           </div>
        </div>
      )}

      {stage === 'complete' && (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
           <div className="w-24 h-24 rounded-[3rem] bg-foreground text-background flex items-center justify-center text-4xl mx-auto shadow-2xl animate-bounce">
              ✨
           </div>
           <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tightest uppercase">Profile Matrix Active</h2>
              <p className="text-xl font-bold text-muted-foreground opacity-60">Landing in Workspace...</p>
           </div>
        </div>
      )}
    </main>
  );
}
