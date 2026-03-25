const flag = (process.env.SPRINT_DEBUG || process.env.NEXT_PUBLIC_SPRINT_DEBUG || '').toLowerCase();

export const isSprintDebugEnabled = flag === '1' || flag === 'true' || flag === 'yes';

export function logSprintDebug(message: string, details?: Record<string, unknown>) {
  if (!isSprintDebugEnabled) return;

  if (details && Object.keys(details).length > 0) {
    console.log(`[sprint] ${message}`, details);
    return;
  }

  console.log(`[sprint] ${message}`);
}
