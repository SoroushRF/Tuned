'use client';

import React from 'react';
import { SprintCard as SprintCardType } from '@/types';
import { useSprint } from '@/hooks/useSprint';

interface SprintPanelProps {
  cards: SprintCardType[];
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SprintPanel({ cards }: SprintPanelProps) {
  const {
    currentCard,
    currentIndex,
    completedIndices,
    progress,
    stage,
    showChallenge,
    showRescue,
    streak,
    bestStreak,
    timerEnabled,
    isTimerRunning,
    elapsedSeconds,
    toggleTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    prevCard,
    nextCardStep,
    completeCard,
    markCardActive,
    triggerRescue,
    dismissRescue,
    resetSprint,
    isFirst,
    isLast,
    hasCards,
    isComplete,
  } = useSprint(cards);

  if (!hasCards || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[700px] px-8 py-12">
        <div className="max-w-xl rounded-[3rem] border border-border/40 bg-card px-10 py-14 text-center shadow-premium">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary/70">Sprint Mode</p>
          <h3 className="mt-5 text-3xl font-black tracking-tightest">Nothing to focus on yet.</h3>
          <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed">
            Upload content first, and Sprint will turn it into one focused concept at a time.
          </p>
        </div>
      </div>
    );
  }

  const isTimerActive = timerEnabled && isTimerRunning;

  return (
    <div className="flex flex-col gap-10 h-full animate-fade-in-up duration-1000 max-w-5xl mx-auto py-10 px-6">
      <div className="flex flex-col gap-6 px-2">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.55em] text-primary/70">Sprint Focus</p>
            <h3 className="text-4xl font-black tracking-tightest uppercase">One concept at a time</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border/60 bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={toggleTimer}
              className="rounded-full border border-border/60 bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-foreground transition-all hover:shadow-sm active:translate-y-[1px]"
            >
              {timerEnabled ? (isTimerRunning ? 'Pause Timer' : 'Resume Timer') : 'Enable Timer'}
            </button>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/50 border border-border/20">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
          <span>{completedIndices.length > 0 ? 'Momentum building' : 'Ready to start'}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{streak > 0 ? `Streak ${streak}` : 'No streak yet'}</span>
          {bestStreak > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>Best {bestStreak}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.55fr] gap-8 min-h-0">
        <div className="rounded-[3.5rem] border border-border/50 bg-card/95 shadow-premium overflow-hidden">
          <div className="flex flex-col gap-8 p-10 md:p-14 min-h-[620px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_0_6px_rgba(0,0,0,0.03)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary/70">
                  {stage === 'complete' ? 'Session complete' : stage === 'rescue' ? 'Rescue mode' : 'Focus card'}
                </p>
              </div>

              <button
                onClick={resetSprint}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground transition-all hover:text-foreground hover:shadow-sm active:translate-y-[1px]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-5">
              <h4 className="text-4xl font-black tracking-tightest leading-tight">{currentCard.title}</h4>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-muted-foreground/50">
                Stay with this one idea before moving on.
              </p>
            </div>

            <div className="flex-1 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-8">
                <div className="rounded-[2.5rem] border border-border/40 bg-secondary/15 p-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">Core points</p>
                  <ul className="mt-6 space-y-4">
                    {currentCard.bullets.slice(0, 3).map((bullet, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/70" />
                        <p className="text-sm font-semibold leading-relaxed text-foreground/80">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2.5rem] border border-border/40 bg-card p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary/70">Focus challenge</p>
                  <p className="mt-4 text-lg font-bold leading-relaxed text-foreground">{currentCard.challenge}</p>
                </div>

                {currentCard.rescue && showRescue && (
                  <div className="rounded-[2.5rem] border border-primary/15 bg-primary/5 p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary/70">Rescue card</p>
                    <p className="mt-4 text-base font-semibold leading-relaxed text-foreground">{currentCard.rescue.reframeText}</p>
                    {currentCard.rescue.hint && (
                      <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{currentCard.rescue.hint}</p>
                    )}
                    {currentCard.rescue.visualAid && (
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">{currentCard.rescue.visualAid}</p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={dismissRescue}
                        className="rounded-full border border-border/60 bg-background px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-foreground transition-all hover:shadow-sm active:translate-y-[1px]"
                      >
                        Close rescue
                      </button>
                      <button
                        onClick={() => completeCard(currentIndex)}
                        className="rounded-full bg-foreground px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-background transition-all hover:shadow-sm active:translate-y-[1px]"
                      >
                        I get it
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="flex flex-col gap-4">
                <div className="rounded-[2rem] border border-border/40 bg-background p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">Mode</p>
                  <p className="mt-3 text-2xl font-black tracking-tightest">{showRescue ? 'Rescue' : showChallenge ? 'Challenge' : 'Focus'}</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {isTimerActive ? 'Timer running.' : timerEnabled ? 'Timer paused.' : 'Timer off.'}
                  </p>
                </div>

                <div className="rounded-[2rem] border border-border/40 bg-background p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">This card</p>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground/80">
                    Keep this page quiet and focused. Finish the idea, then move on.
                  </p>
                  {currentCard.diagramPrompt && (
                    <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-primary/70">
                      Diagram cue: {currentCard.diagramPrompt}
                    </p>
                  )}
                </div>

                <div className="rounded-[2rem] border border-border/40 bg-background p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">Actions</p>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={prevCard}
                      disabled={isFirst}
                      className="rounded-full border border-border/60 bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-foreground transition-all hover:shadow-sm active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        markCardActive(currentIndex);
                        completeCard(currentIndex);
                        nextCardStep();
                      }}
                      className="rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-primary-foreground transition-all hover:shadow-md active:translate-y-[1px]"
                    >
                      Complete and move on
                    </button>
                    <button
                      onClick={() => triggerRescue(currentIndex)}
                      className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-primary transition-all hover:shadow-sm active:translate-y-[1px]"
                    >
                      I need a reset
                    </button>
                  </div>
                </div>
              </aside>
            </div>

            {isComplete && (
              <div className="rounded-[2.5rem] border border-primary/15 bg-primary/5 p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary/70">Sprint complete</p>
                <p className="mt-4 text-lg font-bold leading-relaxed text-foreground">
                  You have worked through the full sprint set. The next step is to revisit the ideas you want to keep warm.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[3rem] border border-border/40 bg-card/80 p-8 shadow-premium">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">Quiet cues</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[2rem] border border-border/30 bg-background p-5">
              <p className="text-sm font-bold text-foreground">Short blocks</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The current sprint flow keeps the visible surface narrow so the user stays on one idea.
              </p>
            </div>
            <div className="rounded-[2rem] border border-border/30 bg-background p-5">
              <p className="text-sm font-bold text-foreground">Progress without pressure</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Progress updates happen visually, but the total card count stays out of the way.
              </p>
            </div>
            <div className="rounded-[2rem] border border-border/30 bg-background p-5">
              <p className="text-sm font-bold text-foreground">Next step</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Task 6 will add the constellation-style progression so this mode feels even more like the final product.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={timerEnabled ? pauseTimer : startTimer}
              className="rounded-full bg-foreground px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-background transition-all hover:shadow-md active:translate-y-[1px]"
            >
              {isTimerRunning ? 'Pause' : timerEnabled ? 'Resume' : 'Start Timer'}
            </button>
            <button
              onClick={resumeTimer}
              className="rounded-full border border-border/60 bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-foreground transition-all hover:shadow-sm active:translate-y-[1px]"
            >
              Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
