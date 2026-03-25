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
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[140px] rounded-full animate-float-delayed" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center text-xl shadow-premium">✨</div>
          <span className="text-xl font-bold tracking-tighter">Tuned</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-xl glass-silk border border-border/40 flex items-center justify-center hover:shadow-md active:translate-y-[1px] transition-all shadow-premium"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </nav>

      <section className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center space-y-16 animate-fade-in-up">
         {/* Hero Header */}
         <div className="space-y-8">
            <h1 className="text-[14vw] md:text-[160px] font-[1000] tracking-tightest leading-[0.8] text-foreground select-none">
               Tuned
            </h1>
         </div>

         {/* Hero Text */}
         <div className="space-y-8 max-w-3xl">
            <p className="text-3xl md:text-5xl font-bold tracking-tight text-foreground/88 lg:leading-[1.15] selection:bg-primary/15">
               Study smarter. <br className="hidden md:block" />
               Stay Tuned.
            </p>
            <p className="text-lg md:text-xl font-medium text-muted-foreground/70 leading-relaxed tracking-tight max-w-xl mx-auto italic">
               One place to focus, learn, and move faster.
            </p>
         </div>

         {/* CTA Section */}
         <div className="flex flex-col items-center gap-12 w-full max-w-sm">
            <Link 
              href="/onboarding"
              className="group w-full py-7 px-10 rounded-2xl bg-foreground text-background font-bold text-xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_28px_rgba(0,0,0,0.12)] dark:shadow-none active:translate-y-[1px] transition-all flex items-center justify-center gap-4 relative overflow-hidden"
            >
               <span className="relative z-10">Get Started</span>
               <div className="relative z-10">
                  <IconArrowRight />
               </div>
            </Link>
        </div>
      </section>

      {/* Decorative Blobs */}
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/6 blur-[100px] rounded-full pointer-events-none" />
    </main>
  );
}
