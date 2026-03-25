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
  
  if (max > 0.75) return 'single'; // One mode takes over
  if (max > 0.55) return 'split';  // One major, two minor
  return 'balanced';              // Equal distribution
};

export const getDominantMode = (neuroPrint: NeuroPrintVector) => {
  const scores = [
    { id: 'audio', val: neuroPrint.audio },
    { id: 'adhd', val: neuroPrint.adhd },
    { id: 'scholar', val: neuroPrint.scholar },
  ].sort((a, b) => b.val - a.val);

  const [primary, secondary] = scores;
  const gap = primary.val - (secondary?.val ?? 0);

  if (primary.id === 'adhd' && primary.val >= 0.55 && gap >= 0.1) return 'adhd';
  if (primary.id === 'audio' && primary.val >= 0.55 && gap >= 0.1) return 'audio';
  if (primary.id === 'scholar' && primary.val >= 0.55 && gap >= 0.1) return 'scholar';

  return 'balanced';
};
