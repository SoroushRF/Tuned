'use client';

import { useState, useCallback } from 'react';
import { QuizQuestion, RescueCard } from '@/types';

/**
 * Parsa - Quiz State Machine Hook
 * Tracks performance and triggers "Rescue Cards" for difficult concepts.
 */
export const useQuiz = (questions: QuizQuestion[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [failedQuestions, setFailedQuestions] = useState<string[]>([]);
  const [activeRescue, setActiveRescue] = useState<RescueCard | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const submitAnswer = useCallback((optionIndex: number) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setActiveRescue(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    } else {
      setFailedQuestions(prev => [...prev, currentQuestion.id]);
      // Trigger Rescue Logic (Mocking for now, could call API)
      setActiveRescue({
        questionId: currentQuestion.id,
        reframeText: currentQuestion.reframedAngle,
        visualAid: "Conceptual mental model"
      });
    }
  }, [currentIndex, questions]);

  const nextAfterRescue = useCallback(() => {
    setActiveRescue(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, questions.length]);

  return {
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    score,
    activeRescue,
    isFinished,
    submitAnswer,
    nextAfterRescue
  };
};
