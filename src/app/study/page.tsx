'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/store/context';
import Link from 'next/link';
import LayoutController from '@/components/StudySurface/LayoutController';
import NeuroPrintProfile from '@/components/Profile/NeuroPrintProfile';
import UploadDesk from '@/components/Upload/UploadDesk';

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const IconLayout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
);

export default function StudyPage() {
  const { state, dispatch } = useAppContext();
  const { neuroPrint, currentSession, isLoading, theme } = state;
  const isDark = theme === 'dark';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspace' | 'upload'>(currentSession ? 'workspace' : 'upload');

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-400">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full glass-silk px-10 py-4 flex items-center justify-between shadow-premium">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group">
            <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center text-lg shadow-premium">✨</div>
            <span className="text-xl font-bold tracking-tighter">Nuro</span>
          </Link>
          
          <nav className="flex items-center gap-2 bg-secondary/30 p-1 rounded-2xl border border-border/40">
            <button 
              onClick={() => setActiveTab('workspace')}
              className={`px-6 py-2 rounded-xl text-[11px] font-bold tracking-tight flex items-center gap-3 transition-all duration-300 ${
                activeTab === 'workspace' 
                  ? 'bg-card text-foreground shadow-premium' 
                  : 'text-muted-foreground hover:bg-card/40'
              }`}
            >
              <IconLayout /> Workspace
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-xl text-[11px] font-bold tracking-tight flex items-center gap-3 transition-all duration-300 ${
                activeTab === 'upload' 
                  ? 'bg-card text-foreground shadow-premium' 
                  : 'text-muted-foreground hover:bg-card/40'
              }`}
            >
               Upload Desk
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full border border-border/40 bg-secondary/20 shadow-inner">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-bold tracking-widest text-muted-foreground/40">Syncing Matrix</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center hover:bg-secondary transition-all active:scale-90 shadow-sm"
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>
            
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center cursor-pointer hover:bg-secondary transition-all active:scale-90 shadow-sm relative group"
            >
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Refined Sidebar */}
        <aside className="w-80 border-r border-border/40 bg-card/10 p-10 flex flex-col gap-12 hidden lg:flex custom-scrollbar overflow-y-auto">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-12 px-2">
               <div className="space-y-1">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-primary/60 uppercase">NeuroPrint</h3>
                  <button onClick={() => setIsProfileOpen(true)} className="text-[11px] font-bold text-muted-foreground/40 hover:text-primary transition-colors">
                    View brain map
                  </button>
               </div>
               <button className="p-3 rounded-xl bg-card border border-border/40 text-primary hover:scale-110 active:scale-95 transition-all shadow-sm">
                  <IconPlus />
               </button>
            </div>
            
            <div className="space-y-10">
              {[
                { label: 'Audio Focus', value: neuroPrint.audio, icon: '🎙️' },
                { label: 'Sprint Energy', value: neuroPrint.adhd, icon: '⚡' },
                { label: 'Scholar Depth', value: neuroPrint.scholar, icon: '📚' },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                       <span className="text-lg opacity-30 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                       <span className="text-[11px] font-bold tracking-tight text-foreground/60">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{Math.round(item.value * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden p-[1px] border border-border/10 shadow-inner">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-lg" 
                      style={{ width: `${item.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-10 rounded-[3rem] bg-indigo-500/5 border border-primary/10 relative overflow-hidden group shadow-sm transition-all hover:shadow-premium">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <h4 className="text-[10px] font-bold tracking-[0.2em] text-primary/60 uppercase">Observation</h4>
            </div>
            <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed tracking-tight relative z-10">
              We've noticed you focus better with audio synthesis. Your current surface is optimized for listening.
            </p>
          </div>
        </aside>

        {/* Dynamic Workspace */}
        <main className="flex-1 overflow-y-auto p-16 relative custom-scrollbar">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-[60] animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl shadow-premium animate-bounce">
                  ✨
                </div>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-sm font-bold tracking-tight text-primary">Adapting Surface...</p>
                   <p className="text-[10px] font-bold tracking-widest text-muted-foreground/30">Gemini 1.5 Active</p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto h-full min-h-[600px] animate-fade-in-up">
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
