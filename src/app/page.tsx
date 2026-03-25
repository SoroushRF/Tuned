'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/context';

const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const IconSun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
);

const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default function Home() {
  const { state, dispatch } = useAppContext();
  const router = useRouter();
  const isDark = state.theme === 'dark';

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-400">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-10 pt-10 pb-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
            N
          </div>
          <span className="text-2xl font-bold tracking-tighter">Nuro</span>
        </div>

        <div className="flex items-center gap-10">
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-secondary border border-border/50 hover:border-primary/40 transition-all active:scale-95 shadow-sm"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto pt-4 pb-32 px-10 flex flex-col items-center text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-border bg-secondary/50 mb-10 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Session-based • Local Context Only
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tightest selection:bg-primary/20">
          Neural <br /> 
          <span className="text-primary text-6xl md:text-8xl">Empowerment.</span>
        </h1>

        <p className="max-w-xl text-xl text-muted-foreground mb-16 font-medium leading-[1.6] selection:bg-primary/20 opacity-80">
          Nuro builds a digital map of how you learn and transforms your materials in real-time. No database, no tracking—just your brain and AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-16 relative z-10">
          <Link 
            href="/onboarding"
            className="group px-12 py-6 rounded-[3rem] bg-foreground text-background font-black text-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_80px_-15px_rgba(99,102,241,0.3)] hover:scale-[1.08] active:scale-95 transition-all flex items-center gap-5 tracking-tight"
          >
             Start Analyzing ✨
            <div className="group-hover:translate-x-2 transition-transform duration-500"><IconArrowRight /></div>
          </Link>
        </div>
      </section>
    </main>
  );
}
