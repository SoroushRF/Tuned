'use client';

import { useState, useCallback } from 'react';
import { SprintCard } from '@/types';

/**
 * Parsa - Sprint Navigation Hook
 * Manages the sequential progression through study cards and challenge verification.
 */
export const useSprint = (cards: SprintCard[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [showChallenge, setShowChallenge] = useState(false);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowChallenge(false);
    }
  }, [currentIndex, cards.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowChallenge(false);
    }
  }, [currentIndex]);

  const completeCard = useCallback((index: number) => {
    if (!completedIndices.includes(index)) {
      setCompletedIndices(prev => [...prev, index]);
    }
    if (index === currentIndex) {
      setShowChallenge(true);
    }
  }, [completedIndices, currentIndex]);

  const resetSprint = useCallback(() => {
    setCurrentIndex(0);
    setCompletedIndices([]);
    setShowChallenge(false);
  }, []);

  return {
    currentCard: cards[currentIndex],
    currentIndex,
    totalCards: cards.length,
    completedIndices,
    showChallenge,
    setShowChallenge,
    nextCard,
    prevCard,
    completeCard,
    resetSprint,
    isFirst: currentIndex === 0,
    isLast: currentIndex === cards.length - 1,
    progress: (completedIndices.length / cards.length) * 100
  };
};
