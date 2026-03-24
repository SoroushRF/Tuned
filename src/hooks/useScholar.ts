'use client';

import { useState, useCallback } from 'react';
import { ScholarContent } from '@/types';

/**
 * Parsa - Scholar State Hook
 * Manages the interaction between original and simplified text views.
 */
export const useScholar = (content: ScholarContent) => {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [isSimplifiedVisible, setIsSimplifiedVisible] = useState(true);

  const toggleView = useCallback(() => {
    setIsSimplifiedVisible(prev => !prev);
  }, []);

  const selectTerm = useCallback((term: string | null) => {
    setActiveTerm(term);
  }, []);

  return {
    content,
    activeTerm,
    selectTerm,
    isSimplifiedVisible,
    toggleView,
    keyTerms: content.keyTerms
  };
};
