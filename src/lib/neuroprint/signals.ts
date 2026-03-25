import { NeuroPrintVector } from '@/types';

export type SprintAdaptiveSignal =
  | 'timer_engaged'
  | 'timed_completion'
  | 'sprint_complete'
  | 'skip'
  | 'dismiss_timer'
  | 'dismiss_sprint';

const SIGNAL_DELTAS: Record<SprintAdaptiveSignal, Partial<Pick<NeuroPrintVector, 'audio' | 'adhd' | 'scholar'>>> = {
  timer_engaged: { adhd: 0.02 },
  timed_completion: { adhd: 0.04 },
  sprint_complete: { adhd: 0.03 },
  skip: { adhd: -0.04 },
  dismiss_timer: { adhd: -0.03 },
  dismiss_sprint: { adhd: -0.05 },
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function applySprintSignal(vector: NeuroPrintVector, signal: SprintAdaptiveSignal): NeuroPrintVector {
  if (vector.manualOverride) return vector;

  const delta = SIGNAL_DELTAS[signal];

  return {
    ...vector,
    audio: clamp(vector.audio + (delta.audio ?? 0)),
    adhd: clamp(vector.adhd + (delta.adhd ?? 0)),
    scholar: clamp(vector.scholar + (delta.scholar ?? 0)),
    lastUpdated: Date.now(),
  };
}

export function shouldPromoteSignal(count: number) {
  return count >= 2;
}
