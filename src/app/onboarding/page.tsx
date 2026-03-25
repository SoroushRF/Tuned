'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/context';
import NeuroPrintSurvey from '@/components/Survey/NeuroPrintSurvey';

const IconBrain = () => (
  <div className="relative">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-primary animate-pulse relative z-10">
      <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2"/>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.78-3.94 2.5 2.5 0 0 1-1.26-4.5 2.5 2.5 0 0 1 1.26-4.5 2.5 2.5 0 0 1 2.78-3.94A2.5 2.5 0 0 1 9.5 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.78-3.94 2.5 2.5 0 0 0 1.26-4.5 2.5 2.5 0 0 0-1.26-4.5 2.5 2.5 0 0 0-2.78-3.94A2.5 2.5 0 0 0 14.5 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div className="absolute inset-x-0 h-4 bg-primary/20 blur-2xl rounded-full scale-110 -bottom-4 animate-pulse" />
  </div>
);

export default function OnboardingPage() {
  const { dispatch } = useAppContext();
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
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, router]);

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-12 overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-background pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-float" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-float delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {stage === 'survey' && (
          <NeuroPrintSurvey 
            onComplete={(vector) => {
              dispatch({ type: 'SET_NEUROPRINT', payload: vector });
              setStage('analyzing');
            }} 
          />
        )}

        {stage === 'analyzing' && (
          <div className="w-full max-w-xl p-16 space-y-16 animate-fade-in-up text-center">
             <div className="flex justify-center mb-20">
                <IconBrain />
             </div>

             <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tightest leading-tight dark:text-white">Neural Syncing</h2>
                <div className="h-0.5 w-12 bg-primary/20 mx-auto" />
                <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground/40 uppercase">Calibrating your profile</p>
             </div>

             <div className="space-y-8">
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden p-[1px] border border-border/10 shadow-inner">
                   <div 
                     className="h-full bg-primary transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.6)] rounded-full"
                     style={{ width: `${analysisProgress}%` }}
                   />
                </div>
                <p className="text-xs font-bold text-primary animate-pulse tracking-widest text-shimmer">
                  {analysisSteps[analysisStep] || "Finalizing Sync..."}
                </p>
             </div>
          </div>
        )}

        {stage === 'complete' && (
          <div className="text-center space-y-12 animate-fade-in-up">
             <div className="w-24 h-24 rounded-[3rem] bg-foreground text-background flex items-center justify-center text-4xl mx-auto shadow-premium animate-float ring-8 ring-primary/5">
                ✨
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tightest dark:text-white">Profile Matrix Active</h2>
                <p className="text-lg font-bold text-muted-foreground/60 leading-relaxed tracking-tight">
                  Landing into your custom study workspace...
                </p>
             </div>
          </div>
        )}
      </div>
    </main>
  );
}
