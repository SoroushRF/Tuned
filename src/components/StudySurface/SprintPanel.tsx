'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { SprintCard as SprintCardType } from '@/types';
import { useSprint } from '@/hooks/useSprint';
import { useAppContext } from '@/store/context';
import { applySprintSignal, SprintAdaptiveSignal, shouldPromoteSignal } from '@/lib/neuroprint/signals';

interface SprintPanelProps {
  cards: SprintCardType[];
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const controlClass =
  'rounded-full border border-border/30 bg-card px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-secondary/25 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const primaryControlClass =
  'rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground transition-all hover:opacity-90 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const secondaryControlClass =
  'rounded-full border border-primary/15 bg-primary/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary/[0.06] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const inputLikeSelector = 'input, textarea, select, [contenteditable="true"]';

export default function SprintPanel({ cards }: SprintPanelProps) {
  const { state, dispatch } = useAppContext();
  const signalCounts = useRef<Record<SprintAdaptiveSignal, number>>({
    timer_engaged: 0,
    timed_completion: 0,
    sprint_complete: 0,
    skip: 0,
    dismiss_timer: 0,
    dismiss_sprint: 0,
  });

  const promoteSignal = useCallback((signal: SprintAdaptiveSignal) => {
    const nextCount = signalCounts.current[signal] + 1;
    signalCounts.current[signal] = nextCount;

    if (!shouldPromoteSignal(nextCount)) return;

    signalCounts.current[signal] = 0;
    const nextVector = applySprintSignal(state.neuroPrint, signal);
    if (nextVector !== state.neuroPrint) {
      dispatch({ type: 'SET_NEUROPRINT', payload: nextVector });
    }
  }, [dispatch, state.neuroPrint]);

  const {
    currentCard,
    currentIndex,
    completedIndices,
    stage,
    showChallenge,
    showRescue,
    streak,
    bestStreak,
    milestoneMessage,
    timerEnabled,
    isTimerRunning,
    remainingSeconds,
    timerDurationSeconds,
    showTimerPrompt,
    enableTimer,
    disableTimer,
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
    hasCards,
    isComplete,
  } = useSprint(cards);

  const keyboardHint = useMemo(() => {
    return showRescue
      ? 'Keyboard: Enter accepts rescue, Escape returns, R resets the clue.'
      : 'Keyboard: Left and right arrows move cards, Enter completes, T toggles timer, R resets clue, Escape pauses.';
  }, [showRescue]);

  const isTimerActive = timerEnabled && isTimerRunning;

  const handleCompleteCurrent = useCallback(() => {
    dismissRescue();
    markCardActive(currentIndex);
    promoteSignal(isTimerActive ? 'timed_completion' : 'sprint_complete');
    completeCard(currentIndex);
    nextCardStep();
  }, [completeCard, currentIndex, dismissRescue, isTimerActive, markCardActive, nextCardStep, promoteSignal]);

  const handleResetClue = useCallback(() => {
    promoteSignal('skip');
    triggerRescue(currentIndex);
  }, [currentIndex, promoteSignal, triggerRescue]);

  const handleTimerToggle = useCallback(() => {
    if (timerEnabled) {
      if (isTimerRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
      return;
    }

    promoteSignal('timer_engaged');
    enableTimer();
  }, [enableTimer, isTimerRunning, pauseTimer, promoteSignal, resumeTimer, timerEnabled]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target && target.matches(inputLikeSelector)) return;

      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'p' || key === 'k') {
        event.preventDefault();
        if (!isFirst) {
          prevCard();
        }
        return;
      }

      if (key === 'arrowright' || key === 'n' || key === 'j') {
        event.preventDefault();
        if (!isComplete) {
          nextCardStep();
        }
        return;
      }

      if (key === 't') {
        event.preventDefault();
        handleTimerToggle();
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        handleResetClue();
        return;
      }

      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        if (showRescue && currentCard.rescue) {
          handleCompleteCurrent();
          return;
        }

        if (!isComplete) {
          handleCompleteCurrent();
        }
        return;
      }

      if (key === 'escape') {
        event.preventDefault();
        if (showRescue) {
          dismissRescue();
          return;
        }

        if (showTimerPrompt) {
          promoteSignal('dismiss_timer');
          disableTimer();
          return;
        }

        if (timerEnabled && isTimerRunning) {
          pauseTimer();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    currentCard.rescue,
    disableTimer,
    dismissRescue,
    handleCompleteCurrent,
    isComplete,
    isFirst,
    isTimerRunning,
    nextCardStep,
    pauseTimer,
    prevCard,
    promoteSignal,
    showRescue,
    showTimerPrompt,
    timerEnabled,
  ]);

  if (!hasCards || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[700px] px-8 py-12">
        <div className="max-w-xl rounded-[2rem] border border-border/30 bg-card px-10 py-14 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary/60">Sprint Mode</p>
          <h3 className="mt-5 text-3xl font-black tracking-tightest">Nothing to focus on yet.</h3>
          <p className="mt-4 text-sm font-medium text-muted-foreground leading-relaxed">
            Upload content first, and Sprint will turn it into one focused concept at a time.
          </p>
        </div>
      </div>
    );
  }

  const lastCompletedIndex = completedIndices[completedIndices.length - 1];
  const timerLabel = timerEnabled ? formatTime(remainingSeconds) : `${Math.round(timerDurationSeconds / 60)}:00`;

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in-up duration-1000 max-w-4xl mx-auto py-8 px-6">
      <p className="sr-only" aria-live="polite">
        {keyboardHint}
      </p>
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.55em] text-primary/55">Sprint Focus</p>
          <h3 className="text-xl md:text-2xl font-black tracking-tightest uppercase">One concept at a time</h3>
          <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground/45">
            {keyboardHint}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border/30 bg-card px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            {timerEnabled ? timerLabel : 'Optional'}
          </span>
              <button
                type="button"
                onClick={handleTimerToggle}
                className={controlClass}
                aria-keyshortcuts="T"
          >
            {timerEnabled ? (isTimerRunning ? 'Pause' : 'Resume') : 'Try timer'}
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-border/20 bg-card/70 p-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/55">Progress map</p>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/55">
            {stage === 'complete' ? 'Shape complete' : 'Stars lighting up'}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {cards.map((card, index) => {
            const isActive = index === currentIndex;
            const isDone = completedIndices.includes(index);
            const isRecent = lastCompletedIndex === index;

            return (
              <React.Fragment key={card.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (isDone || isActive) {
                      triggerRescue(index);
                    }
                  }}
                  className={[
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isDone
                      ? "border-primary/35 bg-primary/90 text-background"
                      : isActive
                        ? "border-primary/20 bg-primary/8 text-primary scale-105"
                        : "border-border/25 bg-background text-muted-foreground/20",
                    isRecent ? "ring-2 ring-primary/10" : "",
                  ].join(' ')}
                  aria-label={`Card ${index + 1}`}
                >
                  <span
                    className={[
                      "h-2 w-2 rounded-full transition-all duration-500",
                      isDone ? "bg-current" : isActive ? "bg-primary/70" : "bg-border/35",
                    ].join(' ')}
                  />
                </button>

                {index < cards.length - 1 && (
                  <div
                    className={[
                      "h-px w-8 shrink-0 transition-all duration-500",
                      completedIndices.includes(index) ? "bg-primary/35" : "bg-border/15",
                    ].join(' ')}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-5 min-h-0">
        <div className="rounded-[2rem] border border-border/25 bg-card/90 overflow-hidden">
          <div className="flex flex-col gap-5 p-7 md:p-9 min-h-[560px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary/80" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">
                {stage === 'complete' ? 'Session complete' : stage === 'rescue' ? 'Rescue mode' : 'Focus card'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  promoteSignal('dismiss_sprint');
                  resetSprint();
                }}
                className={controlClass}
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-2xl md:text-3xl font-black tracking-tightest leading-tight">{currentCard.title}</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/45">
                Stay with the clues before moving on.
              </p>
            </div>

            {milestoneMessage && (
              <div className="rounded-[1.5rem] border border-primary/10 bg-primary/[0.03] p-4" aria-live="polite">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">Milestone</p>
                <p className="mt-2 text-sm md:text-base font-semibold leading-relaxed text-foreground/90">
                  {milestoneMessage}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/20 bg-secondary/[0.06] p-6 md:p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/55">Clues</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/35">
                    {currentCard.bullets.slice(0, 3).length} points
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  {currentCard.bullets.slice(0, 3).map((bullet, index) => (
                    <li key={index} className="flex gap-4 items-start rounded-[1.25rem] bg-background/55 border border-border/15 px-4 py-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/65 shrink-0" />
                      <p className="text-[15px] md:text-base font-semibold leading-relaxed text-foreground/90">{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-border/20 bg-card p-6 md:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">Challenge clue</p>
                <p className="mt-3 text-base md:text-lg font-bold leading-relaxed text-foreground/90">
                  {currentCard.challenge}
                </p>
              </div>

              {showRescue && currentCard.rescue && (
                <div className="rounded-[1.5rem] border border-primary/10 bg-primary/[0.03] p-6 md:p-7" aria-live="polite">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">Rescue card</p>
                  <p className="mt-3 text-base font-semibold leading-relaxed text-foreground/90">{currentCard.rescue.reframeText}</p>
                  {currentCard.rescue.hint && (
                    <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{currentCard.rescue.hint}</p>
                  )}
                  {currentCard.rescue.visualAid && (
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-primary/55">
                      {currentCard.rescue.visualAid}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={dismissRescue}
                      className={controlClass}
                      aria-keyshortcuts="Escape"
                    >
                      Back to clue
                    </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCompleteCurrent();
                    }}
                      className={primaryControlClass}
                      aria-keyshortcuts="Enter"
                    >
                      I get it
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isComplete && (
              <div className="rounded-[1.5rem] border border-primary/10 bg-primary/[0.03] p-6 md:p-7" aria-live="polite">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/55">Sprint complete</p>
                <p className="mt-3 text-base md:text-lg font-bold leading-relaxed text-foreground/90">
                  You have worked through the full sprint set. The next step is to revisit the ideas you want to keep warm.
                </p>
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={prevCard}
                disabled={isFirst}
                className={controlClass}
                aria-keyshortcuts="ArrowLeft"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteCurrent}
                className={primaryControlClass}
                aria-keyshortcuts="Enter"
              >
                Complete
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetClue();
                }}
                className={secondaryControlClass}
                aria-keyshortcuts="R"
              >
                Reset clue
              </button>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-[2rem] border border-border/25 bg-card/70 p-4">
          <div className="rounded-[1.5rem] border border-border/20 bg-background p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/55">Mode</p>
            <p className="mt-2 text-lg font-black tracking-tightest">{showRescue ? 'Rescue' : showChallenge ? 'Challenge' : 'Focus'}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              {timerEnabled ? (isTimerRunning ? 'Timer running.' : 'Timer paused.') : 'Timer off.'}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/20 bg-background p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/55">Momentum</p>
            <p className="mt-2 text-2xl font-black tracking-tightest">{streak > 0 ? `Streak ${streak}` : 'Steady'}</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
              {bestStreak > 0 ? `Best run ${bestStreak}` : 'One concept, one step.'}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-border/20 bg-background p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground/55">Clue type</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/80">
              {currentCard.diagramPrompt ? 'Text + diagram cue' : 'Text only'}
            </p>
            {currentCard.diagramPrompt && (
              <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-primary/55">
                {currentCard.diagramPrompt}
              </p>
            )}
          </div>

          {(showTimerPrompt || timerEnabled) && (
            <div className="rounded-[1.5rem] border border-primary/10 bg-primary/[0.03] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/55">Power-up</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
                {timerEnabled
                  ? 'The countdown is active. Keep moving at a calm pace.'
                  : 'Want a quiet 5-minute timer? It stays off until you turn it on.'}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {timerEnabled ? (
                  <button
                    type="button"
                    onClick={() => {
                      promoteSignal('dismiss_timer');
                      disableTimer();
                    }}
                    className={controlClass}
                    aria-keyshortcuts="Escape"
                  >
                    Turn off timer
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        promoteSignal('timer_engaged');
                        enableTimer();
                      }}
                      className={primaryControlClass}
                      aria-keyshortcuts="T"
                    >
                      Enable 5-min timer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        promoteSignal('dismiss_timer');
                        disableTimer();
                      }}
                      className={controlClass}
                      aria-keyshortcuts="Escape"
                    >
                      Not now
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={timerEnabled ? (isTimerRunning ? pauseTimer : resumeTimer) : () => {
                handleTimerToggle();
              }}
              className={primaryControlClass}
            >
              {isTimerRunning ? 'Pause timer' : timerEnabled ? 'Resume timer' : 'Start timer'}
            </button>
            <button
              type="button"
              onClick={resumeTimer}
              className={controlClass}
            >
              Resume
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
