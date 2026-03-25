'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/store/context';
import Link from 'next/link';
import LayoutController from '@/components/StudySurface/LayoutController';
import NeuroPrintProfile from '@/components/Profile/NeuroPrintProfile';
import UploadDesk from '@/components/Upload/UploadDesk';

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
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

  React.useEffect(() => {
    if (currentSession) {
      setActiveTab('workspace');
    }
  }, [currentSession]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-400">
      <header className="sticky top-0 z-50 w-full glass-silk px-10 py-4 flex items-center justify-between shadow-premium">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 transition-shadow hover:shadow-md active:translate-y-[1px] group">
            <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center text-lg shadow-premium">N</div>
            <span className="text-xl font-bold tracking-tighter">Nuro</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center hover:bg-secondary transition-all active:translate-y-[1px] shadow-sm"
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center cursor-pointer hover:bg-secondary transition-all active:translate-y-[1px] shadow-sm relative group"
            >
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,0,0,0.08)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/8 rounded-xl blur-lg opacity-0 group-hover:opacity-15 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-2 px-12 pb-12 relative custom-scrollbar">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-[60] animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl shadow-premium">
                  N
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-bold tracking-tight text-primary">Adapting Surface...</p>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground/45">Gemini processing</p>
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
