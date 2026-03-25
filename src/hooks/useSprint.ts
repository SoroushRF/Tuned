'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SprintCard, SprintCardStatus } from '@/types';
import { logSprintDebug } from '@/lib/sprint/debug';

type SprintStage = 'idle' | 'focus' | 'challenge' | 'rescue' | 'complete';

const DEFAULT_TIMER_SECONDS = 5 * 60;

interface UseSprintOptions {
  initialIndex?: number;
  timerSeconds?: number;
}

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
};

/**
 * Parsa - Sprint Navigation Hook
 * Manages focused progression through sprint cards with completion, rescue, and timer state.
 */
export const useSprint = (cards: SprintCard[], options: UseSprintOptions = {}) => {
  const [currentIndex, setCurrentIndex] = useState(() => clampIndex(options.initialIndex ?? 0, cards.length));
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [cardStates, setCardStates] = useState<Record<number, SprintCardStatus>>({});
  const [showChallenge, setShowChallenge] = useState(false);
  const [showRescue, setShowRescue] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const timerDurationSeconds = options.timerSeconds ?? DEFAULT_TIMER_SECONDS;
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(timerDurationSeconds);
  const [hasSeenTimerPrompt, setHasSeenTimerPrompt] = useState(false);
  const lastDebugState = useRef({
    index: -1,
    stage: '' as SprintStage | '',
    timerEnabled: false,
    timerRunning: false,
    streak: 0,
    remainingSeconds: timerDurationSeconds,
  });

  useEffect(() => {
    setCurrentIndex((prev) => clampIndex(prev, cards.length));
    setCompletedIndices((prev) => prev.filter((index) => index < cards.length));
    setCardStates((prev) => {
      const next: Record<number, SprintCardStatus> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const index = Number(key);
        if (index < cards.length) {
          next[index] = value;
        }
      });
      return next;
    });
  }, [cards.length]);

  useEffect(() => {
    if (!timerEnabled || !isTimerRunning) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerEnabled, isTimerRunning]);

  useEffect(() => {
    const nextState = {
      index: currentIndex,
      stage: cards.length === 0
        ? 'idle'
        : completedIndices.length >= cards.length
          ? 'complete'
          : showRescue
            ? 'rescue'
            : showChallenge
              ? 'challenge'
              : 'focus',
      timerEnabled,
      timerRunning: isTimerRunning,
      streak,
      remainingSeconds,
    } as const;

    const previous = lastDebugState.current;
    const hasChanged =
      previous.index !== nextState.index ||
      previous.stage !== nextState.stage ||
      previous.timerEnabled !== nextState.timerEnabled ||
      previous.timerRunning !== nextState.timerRunning ||
      previous.streak !== nextState.streak ||
      previous.remainingSeconds !== nextState.remainingSeconds;

    if (hasChanged) {
      logSprintDebug('state', {
        currentIndex: nextState.index,
        stage: nextState.stage,
        timerEnabled: nextState.timerEnabled,
        timerRunning: nextState.timerRunning,
        streak: nextState.streak,
        remainingSeconds: nextState.remainingSeconds,
        completedCount: completedIndices.length,
        totalCards: cards.length,
      });
      lastDebugState.current = {
        index: nextState.index,
        stage: nextState.stage,
        timerEnabled: nextState.timerEnabled,
        timerRunning: nextState.timerRunning,
        streak: nextState.streak,
        remainingSeconds: nextState.remainingSeconds,
      };
    }
  }, [
    cards.length,
    completedIndices.length,
    currentIndex,
    isTimerRunning,
    remainingSeconds,
    showChallenge,
    showRescue,
    streak,
    timerEnabled,
  ]);

  const currentCard = cards[currentIndex];
  const previousCard = currentIndex > 0 ? cards[currentIndex - 1] : undefined;
  const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : undefined;

  const setCardStatus = useCallback((index: number, status: SprintCardStatus) => {
    setCardStates((prev) => ({ ...prev, [index]: status }));
  }, []);

  const goToCard = useCallback((index: number) => {
    logSprintDebug('go_to_card', { from: currentIndex, to: index });
    setCurrentIndex(clampIndex(index, cards.length));
    setShowChallenge(false);
    setShowRescue(false);
  }, [cards.length]);

  const advanceCard = useCallback(() => {
    logSprintDebug('advance_card', { from: currentIndex });
    setCurrentIndex((prev) => {
      if (prev >= cards.length - 1) return prev;
      return prev + 1;
    });
    setShowChallenge(false);
    setShowRescue(false);
  }, [cards.length]);

  const prevCard = useCallback(() => {
    logSprintDebug('prev_card', { from: currentIndex });
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setShowChallenge(false);
    setShowRescue(false);
  }, []);

  const completeCard = useCallback((index = currentIndex) => {
    logSprintDebug('complete_card', { index, currentIndex, completedCountBefore: completedIndices.length });
    setCompletedIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
    setCardStatus(index, 'completed');
    setShowChallenge(true);
    setShowRescue(false);
    if (completedIndices.length === 0) {
      setHasSeenTimerPrompt(false);
    }
    setStreak((prev) => {
      const next = prev + 1;
      setBestStreak((best) => Math.max(best, next));
      if (next > 0 && next % 3 === 0) {
        setMilestoneMessage(`You’ve covered ${next} concepts. Keep the rhythm going.`);
      } else {
        setMilestoneMessage(null);
      }
      return next;
    });
  }, [completedIndices.length, currentIndex, setCardStatus]);

  const markCardActive = useCallback((index = currentIndex) => {
    logSprintDebug('mark_active', { index });
    setCardStatus(index, 'active');
    setShowChallenge(false);
    setShowRescue(false);
  }, [currentIndex, setCardStatus]);

  const markCardPending = useCallback((index = currentIndex) => {
    logSprintDebug('mark_pending', { index });
    setCardStatus(index, 'pending');
  }, [currentIndex, setCardStatus]);

  const triggerRescue = useCallback((index = currentIndex) => {
    logSprintDebug('trigger_rescue', { index });
    setCardStatus(index, 'active');
    setShowRescue(true);
    setShowChallenge(false);
  }, [currentIndex, setCardStatus]);

  const dismissRescue = useCallback(() => {
    logSprintDebug('dismiss_rescue', { currentIndex });
    setShowRescue(false);
  }, [currentIndex]);

  const enableTimer = useCallback(() => {
    logSprintDebug('enable_timer', { timerDurationSeconds });
    setTimerEnabled(true);
    setIsTimerRunning(true);
    setRemainingSeconds((prev) => (prev > 0 ? prev : timerDurationSeconds));
    setHasSeenTimerPrompt(true);
  }, [timerDurationSeconds]);

  const disableTimer = useCallback(() => {
    logSprintDebug('disable_timer', { timerDurationSeconds });
    setTimerEnabled(false);
    setIsTimerRunning(false);
    setRemainingSeconds(timerDurationSeconds);
    setHasSeenTimerPrompt(true);
  }, [timerDurationSeconds]);

  const toggleTimer = useCallback(() => {
    logSprintDebug('toggle_timer', { timerEnabled });
    setTimerEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setIsTimerRunning(false);
        setRemainingSeconds(timerDurationSeconds);
        setHasSeenTimerPrompt(true);
      }
      if (next) {
        setIsTimerRunning(true);
        setHasSeenTimerPrompt(true);
      }
      return next;
    });
  }, [timerDurationSeconds]);

  const startTimer = useCallback(() => {
    enableTimer();
  }, [enableTimer]);

  const pauseTimer = useCallback(() => {
    logSprintDebug('pause_timer', { remainingSeconds });
    setIsTimerRunning(false);
  }, [remainingSeconds]);

  const resumeTimer = useCallback(() => {
    if (timerEnabled) {
      logSprintDebug('resume_timer', { remainingSeconds });
      setIsTimerRunning(true);
    }
  }, [remainingSeconds, timerEnabled]);

  const resetSprint = useCallback(() => {
    logSprintDebug('reset_sprint', { completedCount: completedIndices.length, streak });
    setCurrentIndex(0);
    setCompletedIndices([]);
    setCardStates({});
    setShowChallenge(false);
    setShowRescue(false);
    setStreak(0);
    setBestStreak(0);
    setMilestoneMessage(null);
    setTimerEnabled(false);
    setIsTimerRunning(false);
    setRemainingSeconds(timerDurationSeconds);
    setHasSeenTimerPrompt(false);
  }, [completedIndices.length, streak, timerDurationSeconds]);

  const progress = useMemo(() => {
    if (cards.length === 0) return 0;
    return (completedIndices.length / cards.length) * 100;
  }, [cards.length, completedIndices.length]);

  const stage: SprintStage = useMemo(() => {
    if (cards.length === 0) return 'idle';
    if (completedIndices.length >= cards.length) return 'complete';
    if (showRescue) return 'rescue';
    if (showChallenge) return 'challenge';
    return 'focus';
  }, [cards.length, completedIndices.length, showChallenge, showRescue]);

  const showTimerPrompt = useMemo(() => {
    return !timerEnabled && !hasSeenTimerPrompt && completedIndices.length > 0;
  }, [completedIndices.length, hasSeenTimerPrompt, timerEnabled]);

  return {
    currentCard,
    previousCard,
    nextCard,
    currentIndex,
    totalCards: cards.length,
    completedIndices,
    cardStates,
    stage,
    showChallenge,
    showRescue,
    setShowChallenge,
    setShowRescue,
    setCardStatus,
    goToCard,
    nextCardStep: advanceCard,
    prevCard,
    completeCard,
    markCardActive,
    markCardPending,
    triggerRescue,
    dismissRescue,
    resetSprint,
    isFirst: currentIndex === 0,
    isLast: currentIndex === cards.length - 1,
    progress,
    streak,
    bestStreak,
    milestoneMessage,
    timerEnabled,
    isTimerRunning,
    remainingSeconds,
    timerDurationSeconds,
    showTimerPrompt,
    toggleTimer,
    startTimer,
    enableTimer,
    disableTimer,
    pauseTimer,
    resumeTimer,
    hasCards: cards.length > 0,
    isComplete: completedIndices.length >= cards.length && cards.length > 0,
  };
};
