'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/store/context';
import Link from 'next/link';
import LayoutController from '@/components/StudySurface/LayoutController';
import NeuroPrintProfile from '@/components/Profile/NeuroPrintProfile';
import UploadDesk from '@/components/Upload/UploadDesk';

const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const IconSun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const IconLayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
);

export default function StudyPage() {
  const { state, dispatch } = useAppContext();
  const { neuroPrint, currentSession, isLoading, theme, streak } = state;
  const isDark = theme === 'dark';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspace' | 'upload'>(currentSession ? 'workspace' : 'upload');

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground transition-colors duration-400`}>
      {/* Friendly Header */}
      {/* V8 Gloss Header - Light Mode Optimized */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/30 backdrop-blur-3xl px-8 py-5 flex items-center justify-between shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
            <div className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl shadow-2xl animate-float">✨</div>
            <span className="text-2xl font-black tracking-tightest text-foreground">Nuro</span>
          </Link>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('workspace')}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.3em] flex items-center gap-3 transition-all duration-500 ${
                activeTab === 'workspace' 
                  ? 'bg-foreground text-background shadow-2xl shadow-foreground/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <IconLayout /> Workspace
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.3em] flex items-center gap-3 transition-all duration-500 ${
                activeTab === 'upload' 
                  ? 'bg-foreground text-background shadow-2xl shadow-foreground/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
               Upload Desk
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/60 border border-border/80 shadow-inner">
             <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
             <span className="text-[9px] font-black tracking-[0.4em] text-muted-foreground/40">Syncing Matrix</span>
          </div>

          <button 
            onClick={toggleTheme}
            className="w-11 h-11 rounded-2xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-90 shadow-sm"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-11 h-11 rounded-2xl bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-all active:scale-90 shadow-sm relative group"
            aria-label="View Profile"
          >
             <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Friendly Sidebar */}
        <aside className="w-80 border-r border-border bg-card/40 p-10 flex flex-col gap-12 hidden lg:flex custom-scrollbar overflow-y-auto">
          <div className="animate-in fade-in slide-in-from-left-6 duration-1000">
            <div className="flex items-center justify-between mb-12">
               <div className="space-y-1">
                  <h3 className="text-[10px] font-black tracking-[0.3em] text-primary">Your NeuroPrint</h3>
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="text-[10px] font-bold underline text-primary/40 hover:text-primary transition-colors tracking-[0.2em]"
                  >
                    View Brain Map
                  </button>
               </div>
               <button className="p-3 rounded-2xl bg-secondary border border-border text-primary hover:scale-110 active:scale-95 transition-all shadow-sm">
                  <IconPlus />
               </button>
            </div>
            
            <div className="space-y-12">
              {[
                { label: 'Audio Focus', value: neuroPrint.audio, icon: '🎙️' },
                { label: 'Sprint Energy', value: neuroPrint.adhd, icon: '⚡' },
                { label: 'Scholar Depth', value: neuroPrint.scholar, icon: '📚' },
              ].map((item, i) => (
                <div key={i} className="group cursor-default">
                  <div className="flex justify-between items-end mb-4 px-1">
                    <div className="flex items-center gap-3">
                       <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                       <span className="text-[10px] font-black tracking-[0.3em] text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{Math.round(item.value * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-[1px] border border-border/10 shadow-inner">
                    <div 
                      className={`h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20`} 
                      style={{ width: `${item.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-10 rounded-[2.5rem] bg-indigo-500/5 border border-primary/20 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <h4 className="text-[10px] font-black tracking-[0.3em] text-primary">Nuro Observation</h4>
            </div>
            <p className="text-xs text-muted-foreground font-bold leading-relaxed tracking-tight relative z-10">
              We've noticed you focus better with audio synthesis. Your current surface is optimized for listening.
            </p>
          </div>
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-16 relative custom-scrollbar bg-secondary/20">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-[60] animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-10">
                <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white text-2xl shadow-2xl animate-bounce">
                  ✨
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-black tracking-[0.4em] text-primary">Adapting Surface...</p>
                    <p className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground opacity-40">GEMINI 1.5 ACTIVE</p>
                 </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto h-full min-h-[600px]">
            {activeTab === 'workspace' && currentSession ? (
              <LayoutController neuroPrint={neuroPrint} session={currentSession} />
            ) : (
              <UploadDesk />
            )}
          </div>
        </main>
      </div>

      {isProfileOpen && (
        <NeuroPrintProfile 
          vector={neuroPrint} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </div>
  );
}

const IconArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
