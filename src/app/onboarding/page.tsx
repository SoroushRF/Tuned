'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/context';
import { NeuroPrintVector } from '@/types';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const IconBrain = () => (
  <div className="relative">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-primary relative z-10">
      <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2"/>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.78-3.94 2.5 2.5 0 0 1-1.26-4.5 2.5 2.5 0 0 1 1.26-4.5 2.5 2.5 0 0 1 2.78-3.94A2.5 2.5 0 0 1 9.5 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.78-3.94 2.5 2.5 0 0 0 1.26-4.5 2.5 2.5 0 0 0-1.26-4.5 2.5 2.5 0 0 0-2.78-3.94A2.5 2.5 0 0 0 14.5 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <div className="absolute inset-x-0 h-4 bg-primary/10 blur-2xl rounded-full scale-110 -bottom-4" />
  </div>
);

export default function OnboardingPage() {
  const { dispatch } = useAppContext();
  const router = useRouter();
  const [stage, setStage] = useState<'survey' | 'analyzing'>('survey');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResultReady, setAnalysisResultReady] = useState(false);

  const analysisSteps = [
    "Reviewing study responses...",
    "Organizing academic patterns...",
    "Assessing learning preferences...",
    "Forming profile summary...",
    "Preparing your workspace..."
  ];

  useEffect(() => {
    if (stage === 'analyzing') {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          const next = analysisResultReady
            ? Math.min(prev + 2, 100)
            : Math.min(prev + 1, 95);
          setAnalysisStep(Math.min(4, Math.floor(next / 20)));
          return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage, analysisResultReady]);

  useEffect(() => {
    if (stage === 'analyzing' && analysisResultReady && analysisProgress >= 100) {
      router.push('/study');
    }
  }, [stage, analysisResultReady, analysisProgress, router]);

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-12 overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-background pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/6 blur-[120px] rounded-full animate-float" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/3 blur-[120px] rounded-full animate-float delay-1000" />
      </div>

      {stage === 'survey' && (
        <OnboardingFlow 
          onBeginCalibration={() => {
            setAnalysisProgress(0);
            setAnalysisStep(0);
            setAnalysisResultReady(false);
            setStage('analyzing');
          }}
          onComplete={(vector: NeuroPrintVector) => {
            dispatch({ type: 'SET_NEUROPRINT', payload: vector });
            setAnalysisResultReady(true);
          }} 
        />
      )}

        {stage === 'analyzing' && (
          <div className="w-full max-w-xl p-16 space-y-16 animate-fade-in-up text-center">
             <div className="flex justify-center mb-20">
                <IconBrain />
             </div>

             <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tightest leading-tight text-foreground">Reviewing Profile</h2>
                <div className="h-0.5 w-12 bg-primary/15 mx-auto" />
                <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground/70 uppercase">Analyzing study inputs</p>
             </div>

             <div className="space-y-8">
                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden p-[1px] border border-border/10 shadow-inner">
                   <div 
                     className="h-full bg-primary transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.08)] rounded-full"
                     style={{ width: `${analysisProgress}%` }}
                   />
                </div>
                <p className="text-xs font-bold text-primary tracking-widest">
                  {analysisSteps[analysisStep] || "Finalizing Sync..."}
                </p>
             </div>
          </div>
        )}

    </main>
  );
}
