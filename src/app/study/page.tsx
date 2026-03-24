'use client';

import React from 'react';
import { useAppContext } from '@/store/context';
import Link from 'next/link';
import LayoutController from '@/components/StudySurface/LayoutController';

export default function StudyPage() {
  const { state } = useAppContext();
  const { neuroPrint, currentSession, isLoading } = state;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            Nuro
          </Link>
          <div className="h-4 w-px bg-white/20 mx-2" />
          <span className="text-sm font-medium text-white/60">Study Surface</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-400">Streak</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
              🔥 {state.streak}
            </span>
          </div>
          <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            👤
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - NeuroPrint Preview */}
        <aside className="w-80 border-r border-white/10 bg-white/[0.02] p-6 flex flex-col gap-8 hidden lg:flex">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">Your NeuroPrint</h3>
            <div className="space-y-6">
              {[
                { label: 'Audio Focus', value: neuroPrint.audio, color: 'bg-blue-400' },
                { label: 'Sprint Speed', value: neuroPrint.adhd, color: 'bg-indigo-400' },
                { label: 'Scholar Depth', value: neuroPrint.scholar, color: 'bg-violet-400' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white font-mono">{Math.round(item.value * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000`} 
                      style={{ width: `${item.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-xs text-white/40 leading-relaxed italic">
              "Your learning surface is currently optimized for strong audio retention and fast-paced visual chunks."
            </p>
          </div>
        </aside>

        {/* Main Study Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm font-medium text-white/60 animate-pulse">Gemini is processing your content...</p>
              </div>
            </div>
          ) : null}

          <div className="max-w-4xl mx-auto">
            {currentSession ? (
              <LayoutController neuroPrint={neuroPrint} session={currentSession} />
            ) : (
              <div className="text-center py-20">
                <p className="text-white/40">No active study session. Upload content to begin.</p>
                <Link href="/" className="inline-block mt-4 text-indigo-400 hover:underline">
                  Go to Upload Desk →
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
