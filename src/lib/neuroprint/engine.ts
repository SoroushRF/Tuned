import { NeuroPrintDeltas, NeuroPrintVector } from '@/types';

/**
 * Theoretical min-max ranges for normalization based on weight definitions in weights.ts
 */
const RANGES = {
  audio: { min: 0, max: 0.82 },
  adhd: { min: -0.10, max: 1.08 },
  scholar: { min: -0.05, max: 0.87 }
};

/**
 * Uses min-max scaling to normalize a raw delta sum into a [0, 1] float.
 */
function normalize(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}

/**
 * NeuroPrint Engine - Core calculation logic
 */
export function calculateVector(accumulatedDeltas: NeuroPrintDeltas): NeuroPrintVector {
  return {
    audio: normalize(accumulatedDeltas.audio, RANGES.audio.min, RANGES.audio.max),
    adhd: normalize(accumulatedDeltas.adhd, RANGES.adhd.min, RANGES.adhd.max),
    scholar: normalize(accumulatedDeltas.scholar, RANGES.scholar.min, RANGES.scholar.max),
    lastUpdated: Date.now(),
    manualOverride: false
  };
}
