import { NeuroPrintVector } from '@/types';

/**
 * Parsa - Panel Width Calculation Logic
 * Returns percentage widths for the three main modes based on NeuroPrint scores.
 */
export const calculatePanelWidths = (neuroPrint: NeuroPrintVector) => {
  const total = neuroPrint.audio + neuroPrint.adhd + neuroPrint.scholar;
  
  // Prevent division by zero
  if (total === 0) return { audio: 33.3, adhd: 33.3, scholar: 33.3 };

  return {
    audio: (neuroPrint.audio / total) * 100,
    adhd: (neuroPrint.adhd / total) * 100,
    scholar: (neuroPrint.scholar / total) * 100,
  };
};

/**
 * Determines the layout strategy (Grid, Flex, or Single) based on dominance.
 */
export const getLayoutStrategy = (neuroPrint: NeuroPrintVector) => {
  const max = Math.max(neuroPrint.audio, neuroPrint.adhd, neuroPrint.scholar);
  
  if (max > 0.8) return 'single'; // One mode takes over
  if (max > 0.5) return 'split';  // One major, two minor
  return 'balanced';              // Equal distribution
};
