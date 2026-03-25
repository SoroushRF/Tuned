'use client';

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/store/context';

const IconMoon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
const IconSun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>;
const IconArrowRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

export default function Home() {
  const { state, dispatch } = useAppContext();
  const isDark = state.theme === 'dark';

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden bg-background">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[140px] rounded-full animate-float-delayed" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center text-xl shadow-premium">✨</div>
          <span className="text-xl font-bold tracking-tighter">Nuro</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/40 bg-secondary/20 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">Gemini 2.5 Active</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-xl glass-silk border border-border/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-premium"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </nav>

      <section className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center space-y-16 animate-fade-in-up">
         {/* Hero Header */}
         <div className="space-y-8">
            <h1 className="text-[14vw] md:text-[160px] font-[1000] tracking-tightest leading-[0.8] text-shimmer select-none">
               Nuro
            </h1>
            <div className="flex flex-col items-center gap-4">
               <span className="text-[11px] font-black tracking-[0.6em] text-primary uppercase opacity-60">
                 Neural Synthesis Engine
               </span>
               <div className="h-0.5 w-16 bg-primary/20 rounded-full" />
            </div>
         </div>

         {/* Hero Text */}
         <div className="space-y-8 max-w-3xl">
            <p className="text-3xl md:text-5xl font-bold tracking-tight text-foreground/90 lg:leading-[1.15] selection:bg-primary/20">
               Build a digital map of your brain. <br className="hidden md:block" />
               Experience academic context that breathes.
            </p>
            <p className="text-lg md:text-xl font-medium text-muted-foreground/50 leading-relaxed tracking-tight max-w-xl mx-auto italic">
               The world&apos;s first adaptive study surface powered by deep behavioral learner signatures.
            </p>
         </div>

         {/* CTA Section */}
         <div className="flex flex-col items-center gap-12 w-full max-w-sm">
            <Link 
              href="/onboarding"
              className="group w-full py-7 px-10 rounded-2xl bg-foreground text-background font-bold text-xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] dark:shadow-none hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-6 relative overflow-hidden"
            >
               <span className="relative z-10">Start Analyzing</span>
               <div className="relative z-10 group-hover:translate-x-2 transition-transform duration-500">
                  <IconArrowRight />
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </Link>

            <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-muted-foreground/30 uppercase">
               <span>Ephemeral Storage</span>
               <div className="w-1 h-1 rounded-full bg-border" />
               <span>Zero Database</span>
               <div className="w-1 h-1 rounded-full bg-border" />
               <span>GDG UTSC AI 2026</span>
            </div>
         </div>
      </section>

      {/* Decorative Blobs */}
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
    </main>
  );
}
