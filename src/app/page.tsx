'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/store/context';
import NeuroPrintSurvey from '@/components/Survey/NeuroPrintSurvey';
import NeuroPrintProfile from '@/components/Profile/NeuroPrintProfile';

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
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDark = state.theme === 'dark';

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-400">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-10 py-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
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
          <Link 
            href="/study"
            className="px-8 py-4 rounded-2xl bg-foreground text-background font-bold shadow-2xl shadow-foreground/10 hover:scale-[1.05] active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Enter Workspace
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto pt-24 pb-48 px-10 flex flex-col items-center text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-border bg-secondary/50 mb-10 text-[11px] font-black uppercase tracking-[0.25em] text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Join GDG AI Case Competition 2026
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[1.05] tracking-tight selection:bg-primary/20">
          Learning that works <br /> 
          <span className="text-primary">for your unique brain.</span>
        </h1>

        <p className="max-w-xl text-xl text-muted-foreground mb-16 font-medium leading-[1.6] selection:bg-primary/20 opacity-80">
          No more one-size-fits-all studying. Nuro builds a digital map of how you learn and transforms your materials in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-32">
          <button 
            onClick={() => setIsSurveyOpen(true)}
            className="group px-12 py-6 rounded-[2.5rem] bg-foreground text-background font-black text-xl shadow-2xl shadow-foreground/10 hover:scale-[1.08] active:scale-95 transition-all flex items-center gap-4"
          >
             Start Studying ✨
            <IconArrowRight />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="px-12 py-6 rounded-[2.5rem] border-2 border-border font-black text-xl hover:bg-secondary transition-all"
          >
            See Your Profile
          </button>
        </div>

        {/* Feature Icons - Friendly Style */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {[
            { title: 'Podcast Synthesis', desc: 'Listen to your notes as conversational AI dialogue.', icon: '🎙️' },
            { title: 'Sprint Mode', desc: 'Fast-paced micro-chunks for rapid retention.', icon: '⚡' },
            { title: 'Rescue System', desc: 'Automatically reframes ideas if you get stuck.', icon: '🧩' },
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-secondary/50 border border-border/60 hover:border-primary/30 transition-all group">
              <div className="w-16 h-16 rounded-[1.5rem] bg-card border border-border flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-black text-2xl mb-4 tracking-tight">{item.title}</h3>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="max-w-7xl mx-auto px-10 py-20 border-t border-border mt-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-60">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-[10px] font-black">GDG</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em]">AI Case Competition 2026</span>
         </div>
         <div className="flex items-center gap-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Parsa × Soroush</span>
         </div>
      </footer>

      {isSurveyOpen && (
        <NeuroPrintSurvey 
          onComplete={(vector) => {
            dispatch({ type: 'SET_NEUROPRINT', payload: vector });
            setIsSurveyOpen(false);
            router.push('/study');
          }} 
        />
      )}

      {isProfileOpen && (
        <NeuroPrintProfile 
          vector={state.neuroPrint} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </main>
  );
}
