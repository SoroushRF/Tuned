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
    <main className="min-h-screen relative flex flex-col items-center justify-center p-12 overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-background pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-float" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-float delay-1000" />
      </div>

      {/* Floating Theme Toggle */}
      <div className="fixed top-12 right-12 z-50">
         <button 
           onClick={toggleTheme}
           className="w-14 h-14 rounded-2xl glass-silk border border-border/50 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-premium"
         >
           {isDark ? <IconSun /> : <IconMoon />}
         </button>
      </div>

      <section className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-14 animate-fade-in-up">
         <div className="flex flex-col items-center gap-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center text-5xl shadow-premium animate-float ring-8 ring-primary/5">
               ✨
            </div>
            
            <div className="space-y-6">
               <h1 className="text-[120px] md:text-[160px] font-[1000] tracking-tightest leading-[0.85] text-shimmer">
                  Nuro
               </h1>
               <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-border/60" />
                  <span className="text-[11px] font-black tracking-[0.5em] text-muted-foreground/40 uppercase">
                     Adaptive Study Companion
                  </span>
                  <div className="h-px w-12 bg-border/60" />
               </div>
            </div>
         </div>

         <div className="space-y-12 max-w-2xl px-6">
            <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground/80 leading-relaxed selection:bg-primary/20">
               Build a digital map of your brain. <br />
               Experience academic context that breathes.
            </p>
            <p className="text-lg font-medium text-muted-foreground/60 leading-relaxed tracking-tight">
               Privacy as a standard. Context as a flow. <br />
               Linear synthesis without tracking or databases.
            </p>
         </div>

         <div className="flex flex-col items-center gap-10 w-full max-w-md">
            <Link 
              href="/onboarding"
              className="group w-full py-8 px-10 rounded-[4rem] bg-foreground text-background font-black text-2xl shadow-premium hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-6 relative overflow-hidden"
            >
               <span className="relative z-10">Start Analyzing</span>
               <div className="relative z-10 group-hover:translate-x-3 transition-transform duration-500">
                  <IconArrowRight />
               </div>
               <div className="absolute inset-x-0 h-full bg-primary/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
            </Link>

            <div className="flex items-center gap-4 px-6 py-3 rounded-full border border-border/60 bg-secondary/30 backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase">
                  Session locked • Ephemeral Memory only
               </span>
            </div>
         </div>
      </section>

      {/* Visual Accents */}
      <div className="fixed bottom-0 left-0 right-0 p-12 flex justify-between items-center pointer-events-none opacity-20 transform translate-y-4">
         <span className="text-[10px] font-black tracking-widest text-muted-foreground">GDG UTSC AI 2026</span>
         <span className="text-[10px] font-black tracking-widest text-muted-foreground italic">Silicon Valley Gloss Design System</span>
      </div>
    </main>
  );
}
