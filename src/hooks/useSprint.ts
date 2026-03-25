'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SprintCard, SprintCardStatus } from '@/types';

type SprintStage = 'idle' | 'focus' | 'challenge' | 'rescue' | 'complete';

interface UseSprintOptions {
  initialIndex?: number;
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
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerEnabled, isTimerRunning]);

  const currentCard = cards[currentIndex];
  const previousCard = currentIndex > 0 ? cards[currentIndex - 1] : undefined;
  const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : undefined;

  const setCardStatus = useCallback((index: number, status: SprintCardStatus) => {
    setCardStates((prev) => ({ ...prev, [index]: status }));
  }, []);

  const goToCard = useCallback((index: number) => {
    setCurrentIndex(clampIndex(index, cards.length));
    setShowChallenge(false);
    setShowRescue(false);
  }, [cards.length]);

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= cards.length - 1) return prev;
      return prev + 1;
    });
    setShowChallenge(false);
    setShowRescue(false);
  }, [cards.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setShowChallenge(false);
    setShowRescue(false);
  }, []);

  const completeCard = useCallback((index = currentIndex) => {
    setCompletedIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
    setCardStatus(index, 'completed');
    setShowChallenge(true);
    setShowRescue(false);
    setStreak((prev) => {
      const next = prev + 1;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
  }, [currentIndex, setCardStatus]);

  const markCardActive = useCallback((index = currentIndex) => {
    setCardStatus(index, 'active');
    setShowChallenge(false);
    setShowRescue(false);
  }, [currentIndex, setCardStatus]);

  const markCardPending = useCallback((index = currentIndex) => {
    setCardStatus(index, 'pending');
  }, [currentIndex, setCardStatus]);

  const triggerRescue = useCallback((index = currentIndex) => {
    setCardStatus(index, 'active');
    setShowRescue(true);
    setShowChallenge(false);
  }, [currentIndex, setCardStatus]);

  const dismissRescue = useCallback(() => {
    setShowRescue(false);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setIsTimerRunning(false);
      }
      return next;
    });
  }, []);

  const startTimer = useCallback(() => {
    setTimerEnabled(true);
    setIsTimerRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerEnabled) {
      setIsTimerRunning(true);
    }
  }, [timerEnabled]);

  const resetSprint = useCallback(() => {
    setCurrentIndex(0);
    setCompletedIndices([]);
    setCardStates({});
    setShowChallenge(false);
    setShowRescue(false);
    setStreak(0);
    setBestStreak(0);
    setTimerEnabled(false);
    setIsTimerRunning(false);
    setElapsedSeconds(0);
  }, []);

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
    timerEnabled,
    isTimerRunning,
    elapsedSeconds,
    toggleTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    hasCards: cards.length > 0,
    isComplete: completedIndices.length >= cards.length && cards.length > 0,
  };
};
